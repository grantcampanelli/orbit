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
  Badge
} from "@mantine/core";
import { useRouter } from "next/router";

// Sample application data type
interface Application {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

export default function Applications() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch applications when component mounts
  useEffect(() => {
    // Mock data for demonstration - replace with actual API call
    const mockApplications: Application[] = [
      {
        id: "engagements",
        name: "Engagements",
        description: "Customer engagement and interaction tracking",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Info Gathering",
        description: "Collection and organization of customer information",
        status: "inactive",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Intuit Assist",
        description: "AI-powered assistance and support tools",
        status: "pending",
        createdAt: new Date().toISOString(),
      }
    ];

    // Simulate API call
    const fetchApplications = async () => {
      if (status === "authenticated") {
        // Replace with actual API call when ready
        setTimeout(() => {
          setApplications(mockApplications);
          setLoading(false);
        }, 800);
      } else {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [status]);

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

  // Handle creating a new application
  const handleCreateApplication = () => {
    router.push("/applications/new");
  };

  // Handle editing an application
  const handleConfigureApplication = (id: string) => {
    router.push(`/applications/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "gray";
      case "pending":
        return "yellow";
      default:
        return "blue";
    }
  };

  return (
    <Container size="lg" py="xl">
      <Flex justify="space-between" align="center" mb="xl">
        <Title>Applications</Title>
        <Button onClick={handleCreateApplication} color="red">
          New Application
        </Button>
      </Flex>

      {applications.length === 0 ? (
        <Box py="xl">
          <Center>
            <Text size="lg" c="dimmed">
              You don&apos;t have any applications yet. Click the button above to create one.
            </Text>
          </Center>
        </Box>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {applications.map((app) => (
            <Card key={app.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="lg">{app.name}</Text>
                <Badge color={getStatusColor(app.status)}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </Badge>
              </Group>

              <Text size="sm" c="dimmed" mb="md">
                {app.description}
              </Text>

              <Text size="xs" c="dimmed" mb="lg">
                Created: {new Date(app.createdAt).toLocaleDateString()}
              </Text>

              <Button
                variant="light"
                color="red"
                onClick={() => handleConfigureApplication(app.id)}
                fullWidth
              >
                Configure
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
