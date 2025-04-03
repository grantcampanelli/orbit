import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Container,
    Title,
    Text,
    Button,
    Card,
    SimpleGrid,
    Group,
    Loader,
    Center,
    Flex,
    Box,
    Badge,
    TextInput,
    Paper,
    ActionIcon,
    Divider,
    Tooltip
} from "@mantine/core";
import { useRouter } from "next/router";
import { IconSearch, IconPlus, IconSettings, IconChartBar } from '@tabler/icons-react';
import Head from "next/head";

// Engagement type data structure
interface EngagementType {
    id: string;
    name: string;
    description: string;
    status: "active" | "inactive" | "beta";
    metrics: {
        avgDuration: string;
        completionRate: number;
        userSatisfaction: number;
    };
    createdAt: string;
}

export default function Engagements() {
    const { data: session, status } = useSession();
    const [engagementTypes, setEngagementTypes] = useState<EngagementType[]>([]);
    const [filteredTypes, setFilteredTypes] = useState<EngagementType[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch engagement types when component mounts
    useEffect(() => {
        // Demo data for engagement types
        const mockEngagementTypes: EngagementType[] = [
            {
                id: "1",
                name: "Production Support",
                description: "Real-time assistance for production issues and troubleshooting",
                status: "active",
                metrics: {
                    avgDuration: "45 min",
                    completionRate: 94,
                    userSatisfaction: 4.7
                },
                createdAt: new Date().toISOString(),
            },
            {
                id: "2",
                name: "Tax Advice",
                description: "One-on-one tax guidance and consultation services",
                status: "active",
                metrics: {
                    avgDuration: "30 min",
                    completionRate: 97,
                    userSatisfaction: 4.8
                },
                createdAt: new Date().toISOString(),
            },
            {
                id: "3",
                name: "Full Service Tax",
                description: "Complete tax preparation and filing service",
                status: "active",
                metrics: {
                    avgDuration: "120 min",
                    completionRate: 91,
                    userSatisfaction: 4.6
                },
                createdAt: new Date().toISOString(),
            },
            {
                id: "4",
                name: "AI Assisted",
                description: "AI-powered support for common questions and quick solutions",
                status: "beta",
                metrics: {
                    avgDuration: "15 min",
                    completionRate: 89,
                    userSatisfaction: 4.5
                },
                createdAt: new Date().toISOString(),
            },
            {
                id: "5",
                name: "Quick Consultation",
                description: "Brief consultation sessions for specific questions",
                status: "active",
                metrics: {
                    avgDuration: "20 min",
                    completionRate: 98,
                    userSatisfaction: 4.9
                },
                createdAt: new Date().toISOString(),
            },
            {
                id: "6",
                name: "Financial Review",
                description: "Comprehensive review of financial statements and accounts",
                status: "inactive",
                metrics: {
                    avgDuration: "60 min",
                    completionRate: 92,
                    userSatisfaction: 4.4
                },
                createdAt: new Date().toISOString(),
            },
            {
                id: "7",
                name: "Business Setup",
                description: "Guidance for new business entity setup and tax compliance",
                status: "active",
                metrics: {
                    avgDuration: "90 min",
                    completionRate: 95,
                    userSatisfaction: 4.8
                },
                createdAt: new Date().toISOString(),
            },
            {
                id: "8",
                name: "Audit Support",
                description: "Expert assistance during tax audits",
                status: "inactive",
                metrics: {
                    avgDuration: "180 min",
                    completionRate: 88,
                    userSatisfaction: 4.7
                },
                createdAt: new Date().toISOString(),
            }
        ];

        // Simulate API call
        const fetchEngagementTypes = async () => {
            if (status === "authenticated") {
                // Replace with actual API call when ready
                setTimeout(() => {
                    setEngagementTypes(mockEngagementTypes);
                    setFilteredTypes(mockEngagementTypes);
                    setLoading(false);
                }, 800);
            } else {
                setLoading(false);
            }
        };

        fetchEngagementTypes();
    }, [status]);

    // Search functionality
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredTypes(engagementTypes);
        } else {
            const filtered = engagementTypes.filter(
                (type) =>
                    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    type.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredTypes(filtered);
        }
    }, [searchTerm, engagementTypes]);

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

    // Handle creating a new engagement type
    const handleCreateEngagementType = () => {
        router.push("/applications/engagements/new");
    };

    // Handle navigating to engagement type details
    const handleViewEngagementType = (id: string) => {
        router.push(`/applications/engagements/${id}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "green";
            case "inactive":
                return "gray";
            case "beta":
                return "blue";
            default:
                return "red";
        }
    };

    return (
        <>
            <Head>
                <title>Engagement Types | Orbit</title>
                <meta name="description" content="Configure and manage engagement types" />
            </Head>
            <Container size="lg" py="xl">
                <Flex justify="space-between" align="center" mb="xl">
                    <Title>Engagement Types</Title>
                    <Button onClick={handleCreateEngagementType} color="red" leftIcon={<IconPlus size={16} />}>
                        New Engagement Type
                    </Button>
                </Flex>

                <Paper shadow="xs" p="md" radius="md" withBorder mb="xl">
                    <TextInput
                        placeholder="Search engagement types..."
                        icon={<IconSearch size={16} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        mb="md"
                    />

                    <Text color="dimmed" size="sm" mb="sm">
                        Configure engagement types for the Virtual Expert Platform
                    </Text>
                </Paper>

                {filteredTypes.length === 0 ? (
                    <Box py="xl">
                        <Center>
                            <Text size="lg" c="dimmed">
                                No engagement types found. Try adjusting your search or create a new one.
                            </Text>
                        </Center>
                    </Box>
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                        {filteredTypes.map((type) => (
                            <Card key={type.id} shadow="sm" padding="lg" radius="md" withBorder>
                                <Group justify="space-between" mb="xs">
                                    <Text fw={500} size="lg">{type.name}</Text>
                                    <Badge color={getStatusColor(type.status)}>
                                        {type.status.charAt(0).toUpperCase() + type.status.slice(1)}
                                    </Badge>
                                </Group>

                                <Text size="sm" c="dimmed" mb="md">
                                    {type.description}
                                </Text>

                                <Divider my="sm" />

                                <Group spacing="xs" mb="md">
                                    <Text size="xs" fw={500}>Avg. Duration:</Text>
                                    <Text size="xs" c="dimmed">{type.metrics.avgDuration}</Text>
                                </Group>

                                <Group spacing="xs" mb="md">
                                    <Text size="xs" fw={500}>Completion Rate:</Text>
                                    <Text size="xs" c="dimmed">{type.metrics.completionRate}%</Text>
                                </Group>

                                <Group spacing="xs" mb="md">
                                    <Text size="xs" fw={500}>Satisfaction:</Text>
                                    <Text size="xs" c="dimmed">{type.metrics.userSatisfaction}/5.0</Text>
                                </Group>

                                <Group mt="lg" position="apart">
                                    <Tooltip label="View Analytics">
                                        <ActionIcon
                                            variant="light"
                                            color="blue"
                                            onClick={() => router.push(`/applications/engagements/${type.id}/analytics`)}
                                        >
                                            <IconChartBar size={16} />
                                        </ActionIcon>
                                    </Tooltip>

                                    <Button
                                        variant="light"
                                        color="red"
                                        rightIcon={<IconSettings size={16} />}
                                        onClick={() => handleViewEngagementType(type.id)}
                                    >
                                        Configure
                                    </Button>
                                </Group>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </Container>
        </>
    );
}