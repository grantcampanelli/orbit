import { authOptions } from "pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prismadb";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Container,
  Group,
  Button,
  Title,
  Text,
  Paper,
  Divider,
  Box,
  Card,
  Loader,
  Center,
  Badge,
  Tabs,
  ActionIcon,
  Tooltip,
  Breadcrumbs,
  Anchor,
  Menu,
  Grid,
  Timeline,
  Modal,
  Stack,
  SimpleGrid
} from "@mantine/core";
import {
  IconArrowNarrowRight,
  IconArrowRight,
  IconBrandTelegram,
  IconCheck,
  IconClipboardList,
  IconClock,
  IconEdit,
  IconGraph,
  IconHistory,
  IconInfoCircle,
  IconPlayerPlay,
  IconSettings,
  IconTools
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Types from the workflows index page
type WorkflowStep = {
  id: string;
  title: string;
  description: string;
  tools?: string[];
};

type Workflow = {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  createdAt: Date;
  popular: boolean;
};

// Mock execution history type
type ExecutionHistory = {
  id: string;
  workflowId: string;
  status: 'completed' | 'failed' | 'in_progress';
  startedAt: Date;
  completedAt?: Date;
  executedBy: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
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

  const workflowId = params?.id as string;

  // In a real implementation, you would fetch the specific workflow from the database
  // For now, we'll return mock data based on the id
  const mockWorkflow: Workflow = {
    id: workflowId,
    name: 'Tax Advice',
    description: 'Step-by-step guidance for tax preparation and optimization for individuals and small businesses',
    category: 'Finance',
    popular: true,
    createdAt: new Date(),
    steps: [
      {
        id: '1-1',
        title: 'Gather Financial Documents',
        description: 'Collect all W-2s, 1099s, receipts, and investment statements for the tax year',
        tools: ['Document Scanner', 'File Organizer']
      },
      {
        id: '1-2',
        title: 'Review Deduction Opportunities',
        description: 'Analyze potential tax deductions based on your financial situation and recent tax law changes',
        tools: ['Deduction Finder', 'Tax Law Database']
      },
      {
        id: '1-3',
        title: 'Calculate Estimated Taxes',
        description: 'Determine your potential tax liability or refund based on current information',
        tools: ['Tax Calculator']
      },
      {
        id: '1-4',
        title: 'Prepare Filing Strategy',
        description: 'Decide on the best filing approach based on your situation and timeline',
        tools: ['Tax Filing Assistant', 'Calendar Tool']
      },
      {
        id: '1-5',
        title: 'Submit and Track Return',
        description: 'File your return electronically and monitor its processing status',
        tools: ['E-Filing System', 'Status Tracker']
      }
    ]
  };

  // Mock execution history data
  const mockExecutionHistory: ExecutionHistory[] = [
    {
      id: 'exec-1',
      workflowId,
      status: 'completed',
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 30), // 30 minutes after start
      executedBy: 'John Doe'
    },
    {
      id: 'exec-2',
      workflowId,
      status: 'failed',
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 15), // 15 minutes after start
      executedBy: 'Jane Smith'
    },
    {
      id: 'exec-3',
      workflowId,
      status: 'in_progress',
      startedAt: new Date(), // Now
      executedBy: 'Current User'
    }
  ];

  return {
    props: { 
      workflow: mockWorkflow,
      executionHistory: mockExecutionHistory
    }
  };
};

type Props = {
  workflow: Workflow;
  executionHistory: ExecutionHistory[];
};

const WorkflowDetail: React.FC<Props> = ({ workflow, executionHistory }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<WorkflowStep | null>(null);
  const [stepModalOpened, { open: openStepModal, close: closeStepModal }] = useDisclosure(false);
  const [runModalOpened, { open: openRunModal, close: closeRunModal }] = useDisclosure(false);
  const flowContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, []);

  const handleStepClick = (step: WorkflowStep) => {
    setActiveStep(step);
    openStepModal();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'in_progress': return 'blue';
      default: return 'gray';
    }
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

  const items = [
    { title: 'Workflows', href: '/tools/workflows' },
    { title: workflow.name, href: `/tools/workflows/${workflow.id}` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container size="lg" py="xl">
      <Head>
        <title>{workflow.name} | Workflows | Orbit</title>
        <meta name="description" content={workflow.description} />
      </Head>

      <Breadcrumbs mb="xl">{items}</Breadcrumbs>

      <Group justify="apart" mb="xl">
        <Box>
          <Group >
            <Title>{workflow.name}</Title>
            {workflow.popular && (
              <Tooltip label="Popular Workflow">
                <Badge color="yellow">Popular</Badge>
              </Tooltip>
            )}
          </Group>
          <Text color="dimmed" size="sm">{workflow.description}</Text>
        </Box>
        <Group>
          <Button 
            leftIcon={<IconPlayerPlay size={16} />} 
            color="green"
            onClick={openRunModal}
          >
            Run Workflow
          </Button>
          <Button
              leftIcon={<IconEdit size={16} />}
              color="blue"
              onClick={() => router.push(`/tools/workflows/${workflow.id}/edit`)}
          >
            Edit Workflow
          </Button>
          {/*<Menu position="bottom-end" withArrow>*/}
          {/*  <Menu.Target>*/}
          {/*    <ActionIcon size="lg" variant="default">*/}
          {/*      <IconSettings size={18} />*/}
          {/*    </ActionIcon>*/}
          {/*  </Menu.Target>*/}
          {/*  <Menu.Dropdown>*/}
          {/*    <Menu.Item icon={<IconEdit size={16} />}>*/}
          {/*      Edit Workflow*/}
          {/*    </Menu.Item>*/}
          {/*    /!*<Menu.Item icon={<IconHistory size={16} />}>*!/*/}
          {/*    /!*  View Execution History*!/*/}
          {/*    /!*</Menu.Item>*!/*/}
          {/*    <Menu.Divider />*/}
          {/*    <Menu.Item icon={<IconTools size={16} />} color="blue">*/}
          {/*      Configure Tools*/}
          {/*    </Menu.Item>*/}
          {/*  </Menu.Dropdown>*/}
          {/*</Menu>*/}
        </Group>
      </Group>

      <Tabs defaultValue="diagram">
        <Tabs.List mb="md">
          <Tabs.Tab value="diagram">Workflow Diagram</Tabs.Tab>
          <Tabs.Tab value="steps">Steps</Tabs.Tab>
          <Tabs.Tab value="history" >Execution History</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="diagram">
          <Paper shadow="xs" p="xl" radius="md" withBorder mb="xl">
            <Title order={4} mb="lg">Workflow Diagram</Title>
            
            {/* Visual workflow diagram */}
            <Box 
              ref={flowContainerRef} 
              style={{ 
                position: 'relative', 
                minHeight: '400px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}
            >
              {workflow.steps.map((step, index) => (
                <Paper
                  key={step.id}
                  shadow="sm"
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    position: 'relative',
                    width: '250px',
                    marginBottom: '15px',
                    marginLeft: `${index * 50}px`,
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                  onClick={() => handleStepClick(step)}
                >
                  <Group justify="apart" mb="xs">
                    <Badge color="blue">{`Step ${index + 1}`}</Badge>
                    {index === 0 && <Badge color="green">Start</Badge>}
                    {index === workflow.steps.length - 1 && <Badge color="red">End</Badge>}
                  </Group>
                  <Text weight={500}>{step.title}</Text>
                  <Text size="xs" color="dimmed" lineClamp={2}>
                    {step.description}
                  </Text>
                  
                  {/* Arrow to next step */}
                  {index < workflow.steps.length - 1 && (
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: '-30px',
                        left: '125px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1
                      }}
                    >
                      <IconArrowNarrowRight size={24} />
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="steps">
          <Paper shadow="xs" p="xl" radius="md" withBorder mb="xl">
            <Title order={4} mb="lg">Workflow Steps</Title>
            
            <Timeline active={1} bulletSize={24} lineWidth={2}>
              {workflow.steps.map((step, index) => (
                <Timeline.Item 
                  key={step.id} 
                  bullet={index === 0 ? <IconCheck size={12} /> : undefined}
                  title={
                    <Group >
                      <Text weight={500}>{step.title}</Text>
                      <Tooltip label="View step details">
                        <ActionIcon size="sm" onClick={() => handleStepClick(step)}>
                          <IconInfoCircle size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  }
                >
                  <Text color="dimmed" size="sm">{step.description}</Text>
                  {step.tools && step.tools.length > 0 && (
                    <Group mt="xs">
                      <Text size="xs" color="dimmed">Tools:</Text>
                      {step.tools.map(tool => (
                        <Badge key={tool} size="sm" color="gray">{tool}</Badge>
                      ))}
                    </Group>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="history">
          <Paper shadow="xs" p="xl" radius="md" withBorder mb="xl">
            <Title order={4} mb="lg">Execution History</Title>
            
            {executionHistory.length === 0 ? (
              <Text color="dimmed">No execution history available for this workflow.</Text>
            ) : (
              <Stack >
                {executionHistory.map((execution) => (
                  <Card key={execution.id} shadow="sm" p="md" radius="md" withBorder>
                    <Group justify="apart">
                      <Box>
                        <Group >
                          <Badge 
                            color={getStatusColor(execution.status)}
                            variant="filled"
                          >
                            {execution.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Text size="sm">Execution ID: {execution.id}</Text>
                        </Group>
                        <Text size="xs" color="dimmed" mt="xs">
                          Started: {formatDate(execution.startedAt)}
                        </Text>
                        {execution.completedAt && (
                          <Text size="xs" color="dimmed">
                            Completed: {formatDate(execution.completedAt)}
                          </Text>
                        )}
                      </Box>
                      <Button 
                        variant="light" 
                        size="xs"
                        rightIcon={<IconArrowRight size={14} />}
                      >
                        View Details
                      </Button>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Step Detail Modal */}
      <Modal
        opened={stepModalOpened}
        onClose={closeStepModal}
        title={activeStep?.title || "Step Details"}
        size="lg"
      >
        {activeStep && (
          <>
            <Text mb="md">{activeStep.description}</Text>
            
            {activeStep.tools && activeStep.tools.length > 0 && (
              <>
                <Divider my="md" />
                <Title order={5} mb="sm">Required Tools</Title>
                <SimpleGrid cols={2} spacing="md">
                  {activeStep.tools.map(tool => (
                    <Card key={tool} shadow="sm" p="md" radius="md" withBorder>
                      <Group>
                        <IconTools size={18} />
                        <Text>{tool}</Text>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              </>
            )}
            
            <Divider my="md" />
            <Group justify="apart">
              <Button variant="outline" onClick={closeStepModal}>
                Close
              </Button>
              <Button color="blue">
                Configure Step
              </Button>
            </Group>
          </>
        )}
      </Modal>

      {/* Run Workflow Modal */}
      <Modal
        opened={runModalOpened}
        onClose={closeRunModal}
        title="Run Workflow"
        size="lg"
      >
        <Text mb="md">
          You are about to run the &quot;{workflow.name}&quot; workflow with {workflow.steps.length} steps.
        </Text>
        
        <Paper withBorder p="md" mb="md">
          <Title order={5} mb="xs">Workflow Summary</Title>
          <Text size="sm" mb="md">{workflow.description}</Text>
          <Group >
            <Badge color="blue">{workflow.category}</Badge>
            <Badge color="gray">{workflow.steps.length} steps</Badge>
          </Group>
        </Paper>
        
        <Divider my="md" />
        
        <Group justify="right">
          <Button variant="outline" onClick={closeRunModal}>
            Cancel
          </Button>
          <Button 
            color="green" 
            leftIcon={<IconBrandTelegram size={16} />}
            onClick={() => {
              closeRunModal();
              // In a real app, this would start the workflow execution
              // and potentially redirect to an execution tracking page
            }}
          >
            Start Workflow
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default WorkflowDetail;

