import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import {
  Container,
  Title,
  Group,
  Text,
  Paper,
  Grid,
  Card,
  Box,
  Flex,
  ActionIcon,
  Badge,
  TextInput,
  Select,
  Table,
  Pagination,
  Loader,
  Center,
  Alert,
  RingProgress,
  SegmentedControl,
  Divider, Button,
} from "@mantine/core";
import { DatePickerInput } from '@mantine/dates';
import {
  IconArrowBack,
  IconSearch,
  IconCalendar,
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconAlertCircle,
  IconUser,
  IconClock,
  IconChevronRight,
  IconFilter,
  IconUsers,
} from "@tabler/icons-react";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

// Types
interface EngagementInstance {
  id: string;
  clientName: string;
  status: "active" | "completed" | "cancelled" | "pending";
  startedAt: string;
  completedAt?: string;
  duration: number; // in minutes
  agentName: string;
  satisfactionScore?: number;
  workflowProgress: number; // percentage
  notes?: string;
}

interface EngagementTypeStats {
  totalEngagements: number;
  activeEngagements: number;
  completedEngagements: number;
  cancelledEngagements: number;
  avgDuration: number; // in minutes
  avgSatisfactionScore: number;
  completionRate: number; // percentage
}

interface DailyStats {
  date: string;
  count: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

interface DurationDistribution {
  range: string;
  count: number;
}

interface AgentPerformance {
  agent: string;
  engagements: number;
  avgDuration: number;
  avgSatisfaction: number;
}

export default function EngagementAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [engagementType, setEngagementType] = useState({
    id: "",
    name: "",
    description: "",
  });
  const [engagements, setEngagements] = useState<EngagementInstance[]>([]);
  const [filteredEngagements, setFilteredEngagements] = useState<EngagementInstance[]>([]);
  const [stats, setStats] = useState<EngagementTypeStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [activePage, setActivePage] = useState(1);
  const [chartType, setChartType] = useState('daily');
  
  // Mock Data - Daily Engagement Counts
  const dailyData: DailyStats[] = [
    { date: "2023-05-01", count: 8 },
    { date: "2023-05-02", count: 12 },
    { date: "2023-05-03", count: 7 },
    { date: "2023-05-04", count: 14 },
    { date: "2023-05-05", count: 18 },
    { date: "2023-05-06", count: 9 },
    { date: "2023-05-07", count: 6 },
    { date: "2023-05-08", count: 11 },
    { date: "2023-05-09", count: 15 },
    { date: "2023-05-10", count: 10 },
    { date: "2023-05-11", count: 13 },
    { date: "2023-05-12", count: 16 },
    { date: "2023-05-13", count: 8 },
    { date: "2023-05-14", count: 5 },
  ];
  
  // Mock Data - Status Distribution
  const statusData: StatusDistribution[] = [
    { status: "Completed", count: 68 },
    { status: "Active", count: 17 },
    { status: "Cancelled", count: 9 },
    { status: "Pending", count: 6 },
  ];
  
  // Mock Data - Duration Distribution
  const durationData: DurationDistribution[] = [
    { range: "0-15 min", count: 12 },
    { range: "15-30 min", count: 35 },
    { range: "30-45 min", count: 28 },
    { range: "45-60 min", count: 14 },
    { range: "60+ min", count: 11 },
  ];
  
  // Mock Data - Agent Performance
  const agentData: AgentPerformance[] = [
    { agent: "Emma Johnson", engagements: 27, avgDuration: 28, avgSatisfaction: 4.8 },
    { agent: "Michael Chen", engagements: 24, avgDuration: 32, avgSatisfaction: 4.6 },
    { agent: "Sarah Williams", engagements: 19, avgDuration: 25, avgSatisfaction: 4.9 },
    { agent: "David Rodriguez", engagements: 18, avgDuration: 31, avgSatisfaction: 4.7 },
    { agent: "Olivia Patel", engagements: 12, avgDuration: 35, avgSatisfaction: 4.5 },
  ];
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Items per page for the engagements list
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (status === "authenticated" && id) {
      // Mock fetch data - in a real app this would be an API call
      const fetchData = async () => {
        setLoading(true);
        
        // Simulate API delay
        setTimeout(() => {
          // Set engagement type info
          setEngagementType({
            id: String(id),
            name: "Tax Advice",
            description: "One-on-one tax guidance and consultation services",
          });
          
          // Generate mock engagements
          const mockEngagements: EngagementInstance[] = Array.from({ length: 100 }, (_, i) => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
            
            const statusOptions: EngagementInstance["status"][] = ["active", "completed", "cancelled", "pending"];
            const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
            
            const duration = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
            
            let completedDate;
            if (status === "completed" || status === "cancelled") {
              completedDate = new Date(startDate);
              completedDate.setMinutes(completedDate.getMinutes() + duration);
            }
            
            const agents = ["Emma Johnson", "Michael Chen", "Sarah Williams", "David Rodriguez", "Olivia Patel"];
            const clients = ["Acme Corp", "Global Tech", "Mountain View", "Sunshine Finance", "Riverdale Inc", "Smith Family", "Johnson Consulting", "Garcia Holdings", "Wong Enterprises", "Blue Ocean LLC"];
            
            return {
              id: `eng-${1000 + i}`,
              clientName: clients[Math.floor(Math.random() * clients.length)],
              status,
              startedAt: startDate.toISOString(),
              completedAt: completedDate?.toISOString(),
              duration,
              agentName: agents[Math.floor(Math.random() * agents.length)],
              satisfactionScore: status === "completed" ? Math.floor(Math.random() * 5) + 1 : undefined,
              workflowProgress: status === "completed" ? 100 : status === "cancelled" ? Math.floor(Math.random() * 80) : Math.floor(Math.random() * 100),
              notes: Math.random() > 0.7 ? "Client requested follow-up documentation." : undefined,
            };
          });
          
          setEngagements(mockEngagements);
          setFilteredEngagements(mockEngagements);
          
          // Set stats
          setStats({
            totalEngagements: mockEngagements.length,
            activeEngagements: mockEngagements.filter(e => e.status === "active").length,
            completedEngagements: mockEngagements.filter(e => e.status === "completed").length,
            cancelledEngagements: mockEngagements.filter(e => e.status === "cancelled").length,
            avgDuration: Math.round(mockEngagements.reduce((acc, e) => acc + e.duration, 0) / mockEngagements.length),
            avgSatisfactionScore: parseFloat((mockEngagements.filter(e => e.satisfactionScore)
              .reduce((acc, e) => acc + (e.satisfactionScore || 0), 0) / 
              mockEngagements.filter(e => e.satisfactionScore).length).toFixed(1)),
            completionRate: Math.round((mockEngagements.filter(e => e.status === "completed").length / 
              mockEngagements.filter(e => e.status !== "pending").length) * 100),
          });
          
          setLoading(false);
        }, 800);
      };
      
      fetchData();
    }
  }, [id, status]);

  useEffect(() => {
    // Apply filters when search, status, or date range changes
    let filtered = [...engagements];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(engagement => 
        engagement.clientName.toLowerCase().includes(query) ||
        engagement.agentName.toLowerCase().includes(query) ||
        engagement.id.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(engagement => engagement.status === statusFilter);
    }
    
    // Apply date range filter
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].setHours(0, 0, 0, 0);
      const endDate = dateRange[1].setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(engagement => {
        const engagementDate = new Date(engagement.startedAt).getTime();
        return engagementDate >= startDate && engagementDate <= endDate;
      });
    }
    
    setFilteredEngagements(filtered);
    setActivePage(1); // Reset to first page when filters change
  }, [searchQuery, statusFilter, dateRange, engagements]);

  const handleBack = () => {
    router.push(`/applications/engagements/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "blue";
      case "completed": return "green";
      case "cancelled": return "red";
      case "pending": return "orange";
      default: return "gray";
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRange([null, null]);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredEngagements.length / ITEMS_PER_PAGE);
  const paginatedEngagements = filteredEngagements.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  // Show loading state
  if (status === "loading" || loading) {
    return (
      <Container size="lg" py="xl">
        <Center style={{ height: "60vh" }}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (!engagementType.id) {
    return (
      <Container size="lg" py="xl">
        <Alert title="Engagement type not found" color="red" icon={<IconAlertCircle />}>
          The requested engagement type could not be found. Please check the ID and try again.
        </Alert>
        <Group mt="md">
          <ActionIcon 
            size="lg" 
            onClick={() => router.push('/applications/engagements')} 
            variant="subtle"
            aria-label="Go back"
          >
            <IconArrowBack size={20} />
          </ActionIcon>
          <Text>Back to Engagement Types</Text>
        </Group>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{engagementType.name} Analytics | Orbit</title>
        <meta name="description" content={`Engagement analytics for ${engagementType.name}`} />
      </Head>
      
      <Container size="lg" py="xl">
        <Flex justify="space-between" align="center" mb="xl">
          <Group>
            <ActionIcon 
              size="lg" 
              onClick={handleBack} 
              variant="subtle"
              aria-label="Go back"
            >
              <IconArrowBack size={20} />
            </ActionIcon>
            <Title>{engagementType.name} Analytics</Title>
          </Group>
        </Flex>
        
        {/* Overview Stats Section */}
        {stats && (
          <Grid mb="xl">
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <Card withBorder shadow="sm" p="md">
                <Group mb="xs">
                  <Text size="xs" c="dimmed">TOTAL ENGAGEMENTS</Text>
                  <IconUsers size={18} color="gray" />
                </Group>
                <Title order={2}>{stats.totalEngagements}</Title>
                <Group mt="md">
                  <Flex gap="xs">
                    <Badge color="green">{stats.completedEngagements} completed</Badge>
                    <Badge color="blue">{stats.activeEngagements} active</Badge>
                  </Flex>
                </Group>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <Card withBorder shadow="sm" p="md">
                <Group mb="xs">
                  <Text size="xs" c="dimmed">COMPLETION RATE</Text>
                  <IconChartPie size={18} color="gray" />
                </Group>
                <Flex align="center" gap="md">
                  <RingProgress
                    size={60}
                    thickness={5}
                    roundCaps
                    sections={[{ value: stats.completionRate, color: 'green' }]}
                    label={
                      <Text size="xs" ta="center" fw={700}>
                        {stats.completionRate}%
                      </Text>
                    }
                  />
                  <Box>
                    <Title order={2}>{stats.completionRate}%</Title>
                    <Text size="xs" c="dimmed">Success rate</Text>
                  </Box>
                </Flex>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <Card withBorder shadow="sm" p="md">
                <Group  mb="xs">
                  <Text size="xs" c="dimmed">AVG. DURATION</Text>
                  <IconClock size={18} color="gray" />
                </Group>
                <Title order={2}>{stats.avgDuration} min</Title>
                <Text size="xs" c="dimmed" mt="md">
                  Average time to complete an engagement
                </Text>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <Card withBorder shadow="sm" p="md">
                <Group  mb="xs">
                  <Text size="xs" c="dimmed">SATISFACTION SCORE</Text>
                  <IconUser size={18} color="gray" />
                </Group>
                <Title order={2}>{stats.avgSatisfactionScore.toFixed(1)}/5.0</Title>
                <Text size="xs" c="dimmed" mt="md">
                  Based on {stats.completedEngagements} completed engagements
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
        )}
        
        {/* Charts Section */}
        <Paper shadow="xs" p="lg" radius="md" withBorder mb="xl">
          <Flex justify="space-between" align="center" mb="lg">
            <Title order={3}>Performance Metrics</Title>
            <SegmentedControl
              value={chartType}
              onChange={setChartType}
              data={[
                { label: 'Daily Activity', value: 'daily' },
                { label: 'Status', value: 'status' },
                { label: 'Duration', value: 'duration' },
                { label: 'Agent', value: 'agent' },
              ]}
            />
          </Flex>
          
          <Box h={350}>
            {chartType === 'daily' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`${value} engagements`, 'Count']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" name="Engagements" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'status' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} engagements`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'duration' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} engagements`, 'Count']} />
                  <Legend />
                  <Bar dataKey="count" name="Duration Distribution" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'agent' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="agent" type="category" width={120} />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'avgSatisfaction') return [`${value}/5.0`, 'Satisfaction'];
                    if (name === 'avgDuration') return [`${value} min`, 'Avg Duration'];
                    return [`${value}`, name];
                  }} />
                  <Legend />
                  <Bar dataKey="engagements" name="Total Engagements" fill="#0088FE" />
                  <Bar dataKey="avgSatisfaction" name="Satisfaction" fill="#00C49F" />
                  <Bar dataKey="avgDuration" name="Avg Duration (min)" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Paper>
        
        {/* Engagements List Section */}
        <Paper shadow="xs" p="lg" radius="md" withBorder mb="xl">
          <Title order={3} mb="lg">Engagement Instances</Title>
          
          {/* Filters */}
          <Grid mb="md">
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <TextInput
                placeholder="Search by client or agent"
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                placeholder="Filter by status"
                leftSection={<IconFilter size={16} />}
                value={statusFilter}
                onChange={setStatusFilter}
                data={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'pending', label: 'Pending' },
                ]}
              />
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 5 }}>
              <DatePickerInput
                type="range"
                placeholder="Filter by date range"
                value={dateRange}
                onChange={setDateRange}
                leftSection={<IconCalendar size={16} />}
                clearable
              />
            </Grid.Col>
          </Grid>
          
          {/* Results info and reset filters */}
          <Flex justify="space-between" align="center" mb="md">
            <Text size="sm">
              Showing {Math.min(filteredEngagements.length, ITEMS_PER_PAGE)} of {filteredEngagements.length} results
              {filteredEngagements.length !== engagements.length && ` (filtered from ${engagements.length})`}
            </Text>
            
            {(searchQuery || statusFilter !== 'all' || (dateRange[0] && dateRange[1])) && (
              <Button variant="subtle" compact onClick={resetFilters}>
                Reset Filters
              </Button>
            )}
          </Flex>
          
          {/* Table of engagements */}
          <Box style={{ overflowX: 'auto' }}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Client</Table.Th>
                  <Table.Th>Agent</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Started</Table.Th>
                  <Table.Th>Duration</Table.Th>
                  <Table.Th>Progress</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedEngagements.length > 0 ? (
                  paginatedEngagements.map((engagement) => (
                    <Table.Tr key={engagement.id}>
                      <Table.Td>{engagement.id}</Table.Td>
                      <Table.Td>{engagement.clientName}</Table.Td>
                      <Table.Td>{engagement.agentName}</Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(engagement.status)}>
                          {engagement.status.charAt(0).toUpperCase() + engagement.status.slice(1)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{new Date(engagement.startedAt).toLocaleDateString()}</Table.Td>
                      <Table.Td>{engagement.duration} min</Table.Td>
                      <Table.Td>
                        <Flex align="center" gap="xs">
                          <Box w={50}>
                            <Text size="xs">{engagement.workflowProgress}%</Text>
                          </Box>
                          <Box style={{ flex: 1 }}>
                            <div 
                              style={{ 
                                height: 8, 
                                background: '#f0f0f0', 
                                borderRadius: 4,
                                position: 'relative',
                              }}
                            >
                              <div 
                                style={{ 
                                  height: '100%', 
                                  width: `${engagement.workflowProgress}%`, 
                                  background: engagement.status === 'cancelled' ? '#ff6b6b' : '#228be6',
                                  borderRadius: 4,
                                  transition: 'width 0.3s ease',
                                }}
                              />
                            </div>
                          </Box>
                        </Flex>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          variant="subtle"
                          compact
                          rightIcon={<IconChevronRight size={16} />}
                          onClick={() => router.push(`/applications/engagements/${id}/instances/${engagement.id}`)}
                        >
                          Details
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={8} style={{ textAlign: 'center' }}>
                      <Text c="dimmed" py="lg">No engagements found matching your filters</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Box>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center" mt="lg">
              <Pagination 
                total={totalPages} 
                value={activePage} 
                onChange={setActivePage} 
                withEdges
              />
            </Flex>
          )}
        </Paper>
      </Container>
    </>
  );
}

