import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import {
  Container,
  Title,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Text,
  Paper,
  Card,
  Divider,
  Grid,
  Box,
  Flex,
  Badge,
  Loader,
  Center,
  Textarea,
  Modal,
  Timeline,
  ActionIcon,
  Tooltip,
  Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconDeviceFloppy,
  IconArrowBack,
  IconUsers,
  IconSettings,
  IconRobot,
  IconArrowsExchange,
  IconRoute,
  IconCheck,
  IconMessageDots,
  IconAlertCircle,
} from "@tabler/icons-react";

// Types
interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: "manual" | "automated" | "decision";
  estimatedDuration: number;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface AIAssistConfig {
  enabled: boolean;
  model: string;
  knowledgeBaseId: string;
  promptTemplate: string;
}

interface EngagementType {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "beta";
  estimatedDuration: number;
  metrics: {
    avgDuration: string;
    completionRate: number;
    userSatisfaction: number;
  };
  workflow: {
    id: string;
    name: string;
    steps: WorkflowStep[];
  };
  roles: {
    id: string;
    name: string;
  }[];
  aiAssist: AIAssistConfig;
  createdAt: string;
  lastModified: string;
}

export default function EngagementTypeDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  
  const [engagementType, setEngagementType] = useState<EngagementType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (status === "authenticated" && id) {
      // Mock fetch data - in a real app this would be an API call
      const fetchEngagementType = async () => {
        setLoading(true);
        
        // Simulate API delay
        setTimeout(() => {
          // Mock data for Tax Advice engagement type
          const mockEngagementType: EngagementType = {
            id: "1",
            name: "Tax Advice",
            description: "One-on-one tax guidance and consultation services",
            status: "active",
            estimatedDuration: 30,
            metrics: {
              avgDuration: "30 min",
              completionRate: 97,
              userSatisfaction: 4.8
            },
            workflow: {
              id: "wf-101",
              name: "Tax Advice Workflow",
              steps: [
                {
                  id: "step-1",
                  name: "Initial Assessment",
                  description: "Gather client information and understand the tax issue",
                  type: "manual",
                  estimatedDuration: 5
                },
                {
                  id: "step-2",
                  name: "Document Review",
                  description: "Review relevant tax documents and history",
                  type: "manual",
                  estimatedDuration: 10
                },
                {
                  id: "step-3",
                  name: "AI-assisted Research",
                  description: "Use AI to find relevant tax codes and precedents",
                  type: "automated",
                  estimatedDuration: 3
                },
                {
                  id: "step-4",
                  name: "Solution Formulation",
                  description: "Develop tax advice based on findings",
                  type: "manual",
                  estimatedDuration: 8
                },
                {
                  id: "step-5",
                  name: "Documentation",
                  description: "Document the advice provided for records",
                  type: "manual",
                  estimatedDuration: 4
                }
              ]
            },
            roles: [
              { id: "role-1", name: "Tax Advisor" },
              { id: "role-2", name: "Tax Specialist" },
              { id: "role-3", name: "Client" }
            ],
            aiAssist: {
              enabled: true,
              model: "gpt-4",
              knowledgeBaseId: "kb-tax-2023",
              promptTemplate: "You are a tax assistant helping a tax professional. Using the following tax information and client context, provide relevant tax code references and advice options: {{context}}"
            },
            createdAt: "2023-01-15T12:00:00Z",
            lastModified: "2023-12-01T15:30:00Z"
          };
          
          setEngagementType(mockEngagementType);
          setLoading(false);
        }, 800);
      };
      
      fetchEngagementType();
    }
  }, [id, status]);

  const handleSave = () => {
    setSaving(true);
    
    // Simulate API call to save changes
    setTimeout(() => {
      setSaving(false);
      notifications.show({
        title: 'Changes saved',
        message: `${engagementType?.name} configuration has been updated successfully`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    }, 1000);
  };

  const handleBack = () => {
    router.push("/applications/engagements");
  };

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

  if (!engagementType) {
    return (
      <Container size="lg" py="xl">
        <Alert title="Engagement type not found" color="red" icon={<IconAlertCircle />}>
          The requested engagement type could not be found. Please check the ID and try again.
        </Alert>
        <Button mt="md" onClick={handleBack} leftIcon={<IconArrowBack size={16} />}>
          Back to Engagement Types
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{engagementType.name} Configuration | Orbit</title>
        <meta name="description" content={`Configure ${engagementType.name} engagement type`} />
      </Head>
      
      <Modal 
        opened={opened} 
        onClose={close} 
        title={<Title order={3}>Workflow: {engagementType.workflow.name}</Title>}
        size="lg"
      >
        <Box p="md">
          <Text mb="md" size="sm" c="dimmed">
            This workflow defines the sequence of steps for {engagementType.name} engagements.
            Total estimated duration: {engagementType.workflow.steps.reduce((acc, step) => acc + step.estimatedDuration, 0)} minutes.
          </Text>
          
          <Timeline active={engagementType.workflow.steps.length - 1} bulletSize={24} lineWidth={2}>
            {engagementType.workflow.steps.map((step, index) => (
              <Timeline.Item 
                key={step.id} 
                title={step.name}
                bullet={
                  step.type === "manual" ? <IconUsers size={12} /> : 
                  step.type === "automated" ? <IconRobot size={12} /> : 
                  <IconRoute size={12} />
                }
                color={
                  step.type === "manual" ? "blue" : 
                  step.type === "automated" ? "green" : 
                  "orange"
                }
              >
                <Text size="sm">{step.description}</Text>
                <Text size="xs" c="dimmed" mt={4}>
                  Estimated duration: {step.estimatedDuration} min • Type: {step.type}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Box>
      </Modal>
      
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
            <Title>Configure Engagement Type</Title>
            <Badge 
              color={
                engagementType.status === "active" ? "green" : 
                engagementType.status === "beta" ? "blue" : "gray"
              }
              size="lg"
            >
              {engagementType.status.charAt(0).toUpperCase() + engagementType.status.slice(1)}
            </Badge>
          </Group>
          
          <Button 
            onClick={handleSave} 
            color="green" 
            leftSection={<IconDeviceFloppy size={16} />}
            loading={saving}
          >
            Save Changes
          </Button>
        </Flex>
        
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper shadow="xs" p="lg" radius="md" withBorder mb="xl">
              <Title order={3} mb="md">Basic Information</Title>
              
              <TextInput
                label="Name"
                placeholder="Enter engagement type name"
                mb="md"
                value={engagementType.name}
                onChange={(e) => setEngagementType({...engagementType, name: e.target.value})}
              />
              
              <Textarea
                label="Description"
                placeholder="Describe this engagement type"
                minRows={3}
                mb="md"
                value={engagementType.description}
                onChange={(e) => setEngagementType({...engagementType, description: e.target.value})}
              />
              
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Estimated Duration (minutes)"
                    placeholder="Enter estimated duration"
                    mb="md"
                    min={1}
                    max={480}
                    value={engagementType.estimatedDuration}
                    onChange={(val) => val !== null && setEngagementType({...engagementType, estimatedDuration: Number(val)})}
                  />
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Select
                    label="Status"
                    placeholder="Select status"
                    mb="md"
                    data={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'beta', label: 'Beta' },
                    ]}
                    value={engagementType.status}
                    onChange={(val) => val && setEngagementType({...engagementType, status: val as any})}
                  />
                </Grid.Col>
              </Grid>
            </Paper>
            
            <Paper shadow="xs" p="lg" radius="md" withBorder mb="xl">
              <Title order={3} mb="md">Workflow Configuration</Title>
              
              <Grid>
                <Grid.Col span={8}>
                  <Text>
                    Current workflow: <b>{engagementType.workflow.name}</b>
                  </Text>
                  <Text size="sm" c="dimmed">
                    {engagementType.workflow.steps.length} steps • 
                    Estimated total duration: {engagementType.workflow.steps.reduce((acc, step) => acc + step.estimatedDuration, 0)} minutes
                  </Text>
                </Grid.Col>
                
                <Grid.Col span={4}>
                  <Group justify="end">
                    <Button
                      variant="outline"
                      color="blue"
                      onClick={open}
                      leftSection={<IconRoute size={16} />}
                    >
                      View Workflow
                    </Button>
                  </Group>
                </Grid.Col>
              </Grid>
              
              <Divider my="md" />
              
              <Group justify="end">
                <Button
                  color="orange"
                  leftSection={<IconArrowsExchange size={16} />}
                  onClick={() => router.push(`/applications/workflows/${engagementType.workflow.id}?returnTo=${encodeURIComponent(router.asPath)}`)}
                >
                  Edit Workflow
                </Button>
              </Group>
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper shadow="xs" p="lg" radius="md" withBorder mb="xl">
              <Title order={3} mb="md">Related Configurations</Title>
              
              <Card withBorder shadow="sm" radius="md" mb="md">
                <Group>
                  <Box>
                    <Flex align="center" gap="xs">
                      <IconUsers size={20} />
                      <Text fw={500}>Roles</Text>
                    </Flex>
                    
                    <Text size="sm" c="dimmed" mt="xs">
                      {engagementType.roles.length} roles configured
                    </Text>
                    
                    <Group mt="md">
                      {engagementType.roles.map(role => (
                        <Badge key={role.id} size="sm" variant="outline">
                          {role.name}
                        </Badge>
                      ))}
                    </Group>
                  </Box>
                </Group>
                
                <Button 
                  fullWidth 
                  variant="light" 
                  mt="md"
                  leftSection={<IconSettings size={16} />}
                  onClick={() => router.push(`/applications/roles?engagementType=${engagementType.id}`)}
                >
                  Configure Roles
                </Button>
              </Card>
              
              <Card withBorder shadow="sm" radius="md" mb="md">
                <Group >
                  <Box>
                    <Flex align="center" gap="xs">
                      <IconRobot size={20} />
                      <Text fw={500}>AI Assist</Text>
                    </Flex>
                    
                    <Text size="sm" c="dimmed" mt="xs">
                      Status: {engagementType.aiAssist.enabled ? "Enabled" : "Disabled"}
                    </Text>
                    
                    {engagementType.aiAssist.enabled && (
                      <Text size="sm" mt="xs">
                        Using model: <b>{engagementType.aiAssist.model}</b>
                      </Text>
                    )}
                  </Box>
                </Group>
                
                <Button 
                  fullWidth 
                  variant="light" 
                  mt="md"
                  leftSection={<IconSettings size={16} />}
                  onClick={() => router.push(`/applications/ai-config/${engagementType.id}`)}
                >
                  Configure AI Assist
                </Button>
              </Card>
              
              <Card withBorder shadow="sm" radius="md">
                <Group >
                  <Box>
                    <Flex align="center" gap="xs">
                      <IconMessageDots size={20} />
                      <Text fw={500}>Analytics</Text>
                    </Flex>
                    
                    <Grid mt="xs">
                      <Grid.Col span={6}>
                        <Text size="xs" fw={500}>Avg. Duration:</Text>
                        <Text size="xs" c="dimmed">{engagementType.metrics.avgDuration}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" fw={500}>Completion Rate:</Text>
                        <Text size="xs" c="dimmed">{engagementType.metrics.completionRate}%</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" fw={500}>Satisfaction:</Text>
                        <Text size="xs" c="dimmed">{engagementType.metrics.userSatisfaction}/5.0</Text>
                      </Grid.Col>
                    </Grid>
                  </Box>
                </Group>
                
                <Button 
                  fullWidth 
                  variant="light" 
                  mt="md"
                  onClick={() => router.push(`/applications/engagements/${engagementType.id}/analytics`)}
                >
                  View Analytics
                </Button>
              </Card>
            </Paper>
            
            <Paper shadow="xs" p="lg" radius="md" withBorder>
              <Title order={3} mb="md">Metadata</Title>
              <Text size="sm">
                <b>Created:</b> {new Date(engagementType.createdAt).toLocaleDateString()}
              </Text>
              <Text size="sm">
                <b>Last modified:</b> {new Date(engagementType.lastModified).toLocaleDateString()}
              </Text>
              <Text size="sm">
                <b>ID:</b> {engagementType.id}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
}

