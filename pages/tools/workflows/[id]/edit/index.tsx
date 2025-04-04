import { authOptions } from "pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { GetServerSideProps } from "next";
import prisma from "../../../../../lib/prismadb";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
  Breadcrumbs,
  Anchor,
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  ActionIcon,
  Badge,
  Switch,
  Stack,
  Modal,
  SimpleGrid,
  Tooltip
} from "@mantine/core";
import {
  IconArrowLeft,
  IconTrash,
  IconPlus,
  IconGripVertical,
  IconCheck,
  IconTools,
  IconChevronUp,
  IconChevronDown,
  IconEdit,
  IconAlertCircle
} from '@tabler/icons-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
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

// Add DragDropResult type
type DragDropResult = {
  destination?: {
    index: number;
  };
  source: {
    index: number;
  };
  draggableId: string;
};

// Available categories and tools for selection
const CATEGORIES = ['Finance', 'Marketing', 'Sales', 'HR', 'Legal', 'IT', 'Operations', 'Other'];
const AVAILABLE_TOOLS = [
  'Document Scanner', 
  'File Organizer', 
  'Deduction Finder', 
  'Tax Law Database',
  'Tax Calculator',
  'Tax Filing Assistant',
  'Calendar Tool',
  'E-Filing System',
  'Status Tracker',
  'Email Generator',
  'CRM Integration',
  'AI Assistant',
  'Code Generator',
  'Data Analyzer',
  'Spreadsheet Tool'
];

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

  return {
    props: { 
      workflow: mockWorkflow,
    }
  };
};

type Props = {
  workflow: Workflow;
};

const WorkflowEditor: React.FC<Props> = ({ workflow: initialWorkflow }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [editStepModalOpened, { open: openEditStepModal, close: closeEditStepModal }] = useDisclosure(false);
  const [discardModalOpened, { open: openDiscardModal, close: closeDiscardModal }] = useDisclosure(false);

  // Form for the entire workflow
  const form = useForm({
    initialValues: {
      name: initialWorkflow.name,
      description: initialWorkflow.description,
      category: initialWorkflow.category,
      popular: initialWorkflow.popular,
      steps: initialWorkflow.steps.map(step => ({
        ...step,
        tools: step.tools || []
      }))
    },
    validate: {
      name: (value) => !value.trim() ? 'Name is required' : null,
      description: (value) => !value.trim() ? 'Description is required' : null,
      category: (value) => !value ? 'Category is required' : null,
    },
  });

  // Step form for the modal
  const stepForm = useForm({
    initialValues: {
      id: '',
      title: '',
      description: '',
      tools: [] as string[]
    },
    validate: {
      title: (value) => !value.trim() ? 'Title is required' : null,
      description: (value) => !value.trim() ? 'Description is required' : null,
    }
  });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 600);

    // Warn about unsaved changes when navigating away
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  // Track form changes to detect unsaved changes
  useEffect(() => {
    // Compare current form values with initial values to detect changes
    const isFormChanged = JSON.stringify(form.values) !== JSON.stringify({
      name: initialWorkflow.name,
      description: initialWorkflow.description,
      category: initialWorkflow.category,
      popular: initialWorkflow.popular,
      steps: initialWorkflow.steps.map(step => ({
        ...step,
        tools: step.tools || []
      }))
    });
    
    setUnsavedChanges(isFormChanged);
  }, [form.values, initialWorkflow]);

  // const handleOnDragEnd = (result: DropResult) => {
  //   if (!result.destination) return;
  //
  //   const items = Array.from(form.values.steps);
  //   const [reorderedItem] = items.splice(result.source.index, 1);
  //   items.splice(result.destination.index, 0, reorderedItem);
  //
  //   form.setFieldValue('steps', items);
  // };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(form.values.steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    form.setFieldValue('steps', items);
  };

  const addNewStep = () => {
    const newStep: WorkflowStep = {
      id: `new-${Date.now()}`,
      title: '',
      description: '',
      tools: []
    };
    
    stepForm.setValues(newStep);
    setActiveStepIndex(null); // Indicates we're adding a new step
    openEditStepModal();
  };

  const editStep = (index: number) => {
    const step = form.values.steps[index];
    stepForm.setValues({
      id: step.id,
      title: step.title,
      description: step.description,
      tools: Array.isArray(step.tools) ? step.tools : []
    });
    setActiveStepIndex(index);
    openEditStepModal();
  };

  const saveStep = () => {
    const { hasErrors } = stepForm.validate();
    if (hasErrors) return;
    
    const step = {
      id: stepForm.values.id,
      title: stepForm.values.title,
      description: stepForm.values.description,
      tools: Array.isArray(stepForm.values.tools) ? stepForm.values.tools : []
    };
    
    if (activeStepIndex !== null) {
      // Edit existing step
      const updatedSteps = [...form.values.steps];
      updatedSteps[activeStepIndex] = step;
      form.setFieldValue('steps', updatedSteps);
    } else {
      // Add new step
      form.setFieldValue('steps', [...form.values.steps, step]);
    }
    
    closeEditStepModal();
  };

  const deleteStep = (index: number) => {
    if (confirm('Are you sure you want to delete this step?')) {
      const updatedSteps = [...form.values.steps];
      updatedSteps.splice(index, 1);
      form.setFieldValue('steps', updatedSteps);
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === form.values.steps.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedSteps = [...form.values.steps];
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    
    form.setFieldValue('steps', updatedSteps);
  };

  const handleSave = async () => {
    const { hasErrors } = form.validate();
    if (hasErrors) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please check the form for errors before saving.',
        color: 'red',
        icon: <IconAlertCircle />
      });
      return;
    }
    
    setSaving(true);
    
    try {
      // In a real implementation, you would save to the database here
      // For this example, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      notifications.show({
        title: 'Success',
        message: 'Workflow saved successfully',
        color: 'green',
        icon: <IconCheck />
      });
      
      setUnsavedChanges(false);
      
      // Navigate back to workflow view
      router.push(`/tools/workflows/${initialWorkflow.id}`);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save workflow. Please try again.',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (unsavedChanges) {
      openDiscardModal();
    } else {
      router.push(`/tools/workflows/${initialWorkflow.id}`);
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
    { title: initialWorkflow.name, href: `/tools/workflows/${initialWorkflow.id}` },
    { title: 'Edit', href: `/tools/workflows/${initialWorkflow.id}/edit` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container size="lg" py="xl">
      <Head>
        <title>Edit {initialWorkflow.name} | Workflows | Orbit</title>
        <meta name="description" content={`Edit workflow - ${initialWorkflow.description}`} />
      </Head>

      <Breadcrumbs mb="xl">{items}</Breadcrumbs>

      <Group  mb="xl">
        <Title>Edit Workflow</Title>
        <Group>
          <Button 
            variant="light" 
            leftIcon={<IconArrowLeft size={16} />} 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            color="blue" 
            leftIcon={<IconCheck size={16} />} 
            onClick={handleSave}
            loading={saving}
          >
            Save Changes
          </Button>
        </Group>
      </Group>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Paper shadow="xs" p="xl" radius="md" withBorder mb="xl">
          <Title order={4} mb="lg">Workflow Details</Title>
          
          <Stack >
            <TextInput
              label="Workflow Name"
              placeholder="Enter workflow name"
              required
              {...form.getInputProps('name')}
            />
            
            <Textarea
              label="Description"
              placeholder="Enter workflow description"
              minRows={3}
              required
              {...form.getInputProps('description')}
            />
            
            <Select
              label="Category"
              placeholder="Select category"
              data={CATEGORIES}
              required
              searchable
              {...form.getInputProps('category')}
            />
            
            <Switch
              label="Mark as Popular"
              checked={form.values.popular}
              onChange={(event) => form.setFieldValue('popular', event.currentTarget.checked)}
            />
          </Stack>
        </Paper>

        <Paper shadow="xs" p="xl" radius="md" withBorder mb="xl">
          <Group  mb="lg">
            <Title order={4}>Workflow Steps</Title>
            <Button
              leftIcon={<IconPlus size={16} />}
              onClick={addNewStep}
              size="sm"
            >
              Add Step
            </Button>
          </Group>
          
          {form.values.steps.length === 0 ? (
            <Center p="xl">
              <Box ta="center">
                <Text color="dimmed" mb="md">No steps added yet</Text>
                <Button 
                  variant="outline"
                  leftIcon={<IconPlus size={16} />}
                  onClick={addNewStep}
                >
                  Add Your First Step
                </Button>
              </Box>
            </Center>
          ) : (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="steps">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {form.values.steps.map((step, index) => (
                      <Draggable key={step.id} draggableId={step.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            mb="md"
                            shadow="sm"
                            p="md"
                            radius="md"
                            withBorder
                          >
                            <Group >
                              <Group >
                                <Center {...provided.dragHandleProps}>
                                  <IconGripVertical size={18} color="gray" />
                                </Center>
                                <Badge color="blue" mr="xs">{`Step ${index + 1}`}</Badge>
                                <div>
                                  <Text weight={500}>{step.title}</Text>
                                  <Text size="xs" color="dimmed" lineClamp={1}>
                                    {step.description}
                                  </Text>
                                </div>
                              </Group>
                              
                              <Group >
                                {step.tools && step.tools.length > 0 && (
                                  <Badge color="gray" size="sm">
                                    {step.tools.length} {step.tools.length === 1 ? 'tool' : 'tools'}
                                  </Badge>
                                )}
                                
                                <Group gap={4}>
                                  <Tooltip label="Move up">
                                    <ActionIcon 
                                      size="sm" 
                                      variant="subtle"
                                      disabled={index === 0}
                                      onClick={() => moveStep(index, 'up')}
                                    >
                                      <IconChevronUp size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                  
                                  <Tooltip label="Move down">
                                    <ActionIcon 
                                      size="sm" 
                                      variant="subtle"
                                      disabled={index === form.values.steps.length - 1}
                                      onClick={() => moveStep(index, 'down')}
                                    >
                                      <IconChevronDown size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                  
                                  <Tooltip label="Edit step">
                                    <ActionIcon 
                                      size="sm" 
                                      variant="subtle"
                                      color="blue"
                                      onClick={() => editStep(index)}
                                    >
                                      <IconEdit size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                  
                                  <Tooltip label="Delete step">
                                    <ActionIcon 
                                      size="sm" 
                                      variant="subtle"
                                      color="red"
                                      onClick={() => deleteStep(index)}
                                    >
                                      <IconTrash size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                </Group>
                              </Group>
                            </Group>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Paper>
      </form>

      {/* Edit Step Modal */}
      <Modal
        opened={editStepModalOpened}
        onClose={closeEditStepModal}
        title={activeStepIndex !== null ? "Edit Step" : "Add New Step"}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); saveStep(); }}>
          <Stack >
            <TextInput
              label="Step Title"
              placeholder="Enter step title"
              required
              {...stepForm.getInputProps('title')}
            />
            
            <Textarea
              label="Description"
              placeholder="Enter step description"
              minRows={3}
              required
              {...stepForm.getInputProps('description')}
            />
            
            <Box>
              <Text weight={500} size="sm" mb="xs">Required Tools</Text>
              <MultiSelect
                placeholder="Select tools"
                data={AVAILABLE_TOOLS}
                searchable
                // creatable
                // createLabel={(query) => `+ Create ${query}`}
                // onCreate={(query) => {
                //   return query;
                // }}
                value={stepForm.values.tools}
                onChange={(value) => stepForm.setFieldValue('tools', value)}
              />
              
              {stepForm.values.tools && stepForm.values.tools.length > 0 && (
                <SimpleGrid cols={2} mt="sm" spacing="xs">
                  {stepForm.values.tools.map((tool, i) => (
                    <Group key={i}  p="xs" style={{ border: '1px solid #eee', borderRadius: '4px' }}>
                      <Group >
                        <IconTools size={14} />
                        <Text size="sm">{tool}</Text>
                      </Group>
                      <ActionIcon 
                        size="xs" 
                        color="red" 
                        onClick={() => {
                          const updatedTools = [...stepForm.values.tools];
                          updatedTools.splice(i, 1);
                          stepForm.setFieldValue('tools', updatedTools);
                        }}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </Stack>
          
          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={closeEditStepModal}>
              Cancel
            </Button>
            <Button type="submit" color="blue">
              Save Step
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Discard Changes Modal */}
      <Modal
        opened={discardModalOpened}
        onClose={closeDiscardModal}
        title="Discard Changes"
        size="md"
      >
        <Text mb="xl">
          You have unsaved changes. Are you sure you want to discard them?
        </Text>
        
        <Group justify="flex-end" >
          <Button variant="outline" onClick={closeDiscardModal}>
            Continue Editing
          </Button>
          <Button 
            color="red" 
            onClick={() => {
              closeDiscardModal();
              router.push(`/tools/workflows/${initialWorkflow.id}`);
            }}
          >
            Discard Changes
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default WorkflowEditor;

