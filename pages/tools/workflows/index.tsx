import { authOptions } from "pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { GetServerSideProps } from "next";
import prisma from "../../../lib/prismadb";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Container,
  Group,
  Button,
  Title,
  Text,
  Paper,
  Divider,
  SimpleGrid,
  Box,
  Card,
  Loader,
  Center,
  Badge,
  Modal,
  useMantineTheme,
  Timeline,
  ActionIcon,
  Tooltip
} from "@mantine/core";
import {
  IconArrowRight,
  IconBrandTelegram,
  IconCheck,
  IconFilePlus,
  IconInfoCircle,
  IconPlus,
  IconStar,
  IconUser
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from "next/router";

// Sample workflow type
type Workflow = {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  createdAt: Date;
  popular: boolean;
};

type WorkflowStep = {
  id: string;
  title: string;
  description: string;
  tools?: string[];
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // In a real implementation, you would fetch workflows from the database
  // For now, we'll return mock data
  const mockWorkflows: Workflow[] = [
    {
      id: '1',
      name: 'Tax Advice',
      description: 'Step-by-step guidance for tax preparation and optimization',
      category: 'Finance',
      popular: true,
      createdAt: new Date(),
      steps: [
        {
          id: '1-1',
          title: 'Gather Financial Documents',
          description: 'Collect all W-2s, 1099s, receipts, and investment statements',
          tools: ['Document Scanner', 'File Organizer']
        },
        {
          id: '1-2',
          title: 'Review Deduction Opportunities',
          description: 'Analyze potential tax deductions based on your financial situation',
          tools: ['Deduction Finder']
        },
        {
          id: '1-3',
          title: 'Calculate Estimated Taxes',
          description: 'Determine your potential tax liability or refund',
          tools: ['Tax Calculator']
        },
        {
          id: '1-4',
          title: 'Prepare Filing Strategy',
          description: 'Decide on the best filing approach based on your situation',
          tools: ['Tax Filing Assistant']
        }
      ]
    },
    {
      id: '2',
      name: 'Career Development',
      description: 'Structured approach to advance your career goals',
      category: 'Professional',
      popular: false,
      createdAt: new Date(),
      steps: []
    },
    {
      id: '3',
      name: 'Investment Planning',
      description: 'Strategic investment planning for long-term growth',
      category: 'Finance',
      popular: true,
      createdAt: new Date(),
      steps: []
    }
  ];

  return {
    props: { workflows: mockWorkflows }
  };
};

type Props = {
  workflows: Workflow[];
};

const Workflows: React.FC<Props> = ({ workflows }) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();
  const router = useRouter();

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleOpenWorkflow = (workflow: Workflow) => {
    setActiveWorkflow(workflow);
    open();
  };

  const navigateToWorkflow = (workflowId: string) => {
    router.push(`/tools/workflows/${workflowId}`);
  };

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

  return (
    <Container size="lg" py="xl">
      <Head>
        <title>Workflows | Orbit</title>
        <meta name="description" content="Browse and use AI-powered workflows" />
      </Head>

      <Group  mb="xl">
        <Title>Workflows</Title>
        <Button leftIcon={<IconPlus size={16} />} color="red">
          Create Workflow
        </Button>
      </Group>

      <Paper shadow="xs" p="xl" radius="md" withBorder mb="xl">
        <Group mb="md">
          <Title order={3}>Popular Workflows</Title>
          <Badge color="red" size="lg">Featured</Badge>
        </Group>
        <Divider mb="xl" />
        
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {workflows
            .filter(w => w.popular)
            .map((workflow) => (
              <Card 
                key={workflow.id} 
                shadow="sm" 
                padding="lg" 
                radius="md" 
                withBorder
                style={{ cursor: 'pointer' }}
                onClick={() => navigateToWorkflow(workflow.id)}
              >
                <Group  mb="xs">
                  <Text weight={500}>{workflow.name}</Text>
                  {workflow.popular && <IconStar size={16} color={theme.colors.yellow[6]} />}
                </Group>
                <Text size="sm" color="dimmed" mb="md">
                  {workflow.description}
                </Text>
                <Badge color="blue" mb="md">{workflow.category}</Badge>
                <Group  mt="md">
                  <Text size="xs" color="dimmed">
                    {workflow.steps.length} steps
                  </Text>
                  <Link href={`/tools/workflows/${workflow.id}`} passHref>
                    <Button 
                      component="a"
                      variant="light" 
                      color="red" 
                      size="xs" 
                      rightIcon={<IconArrowRight size={14} />}
                      onClick={(e: { stopPropagation: () => any; }) => e.stopPropagation()}
                    >
                      View
                    </Button>
                  </Link>
                </Group>
              </Card>
            ))}
        </SimpleGrid>
      </Paper>

      <Paper shadow="xs" p="xl" radius="md" withBorder>
        <Title order={3} mb="md">All Workflows</Title>
        <Divider mb="xl" />
        
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {workflows.map((workflow) => (
            <Card 
              key={workflow.id} 
              shadow="sm" 
              padding="lg" 
              radius="md" 
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => navigateToWorkflow(workflow.id)}
            >
              <Group  mb="xs">
                <Text weight={500}>{workflow.name}</Text>
                {workflow.popular && <IconStar size={16} color={theme.colors.yellow[6]} />}
              </Group>
              <Text size="sm" color="dimmed" mb="md">
                {workflow.description}
              </Text>
              <Badge color="blue" mb="md">{workflow.category}</Badge>
              <Group  mt="md">
                <Text size="xs" color="dimmed">
                  {workflow.steps.length} steps
                </Text>
                <Link href={`/tools/workflows/${workflow.id}`} passHref>
                  <Button 
                    component="a"
                    variant="light" 
                    color="red" 
                    size="xs" 
                    rightIcon={<IconArrowRight size={14} />}
                    onClick={(e: { stopPropagation: () => any; }) => e.stopPropagation()}
                  >
                    View
                  </Button>
                </Link>
              </Group>
            </Card>
          ))}
          <Card 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder
            style={{ 
              cursor: 'pointer',
              border: `1px dashed ${theme.colors.gray[5]}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '190px'
            }}
          >
            <IconFilePlus size={28} color={theme.colors.gray[5]} />
            <Text mt="sm" color="dimmed">Create Custom Workflow</Text>
          </Card>
        </SimpleGrid>
      </Paper>

      {/* Modal can be kept for quick preview if desired */}
      <Modal
        opened={opened}
        onClose={close}
        title={activeWorkflow?.name || "Workflow Details"}
        size="lg"
        centered
      >
        {activeWorkflow && (
          <>
            <Text color="dimmed" mb="md">{activeWorkflow.description}</Text>
            <Badge color="blue" mb="xl">{activeWorkflow.category}</Badge>
            
            <Title order={4} mb="md">Workflow Steps</Title>
            <Timeline active={1} bulletSize={24} lineWidth={2}>
              {activeWorkflow.steps.map((step, index) => (
                <Timeline.Item 
                  key={step.id} 
                  bullet={index === 0 ? <IconCheck size={12} /> : undefined}
                  title={step.title}
                >
                  <Text color="dimmed" size="sm">{step.description}</Text>
                  {step.tools && step.tools.length > 0 && (
                    <Group mt="xs">
                      {step.tools.map(tool => (
                        <Badge key={tool} size="sm" color="gray">{tool}</Badge>
                      ))}
                    </Group>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>

            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={close}>Close</Button>
              <Button color="red" leftIcon={<IconBrandTelegram size={16} />}>
                Start Workflow
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Workflows;

