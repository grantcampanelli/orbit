import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import {
  Container,
  Title,
  Button,
  Group,
  Text,
  Paper,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Switch,
  Grid,
  Box,
  Flex,
  Loader,
  Center,
  Stepper,
  ActionIcon,
  Chip,
  Divider,
  MultiSelect,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconArrowBack,
  IconCheck,
  IconUsers,
  IconRoute,
  IconRobot,
  IconPlus,
  IconTrash,
  IconArrowRight,
  IconInfoCircle,
} from "@tabler/icons-react";

export default function ConfigureEngagementType() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  // Form definition using Mantine's useForm
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      status: "active",
      estimatedDuration: 30,
      workflow: {
        name: "",
        steps: [
          {
            name: "",
            description: "",
            type: "manual",
            estimatedDuration: 5,
          },
        ],
      },
      roles: [] as string[],
      aiAssist: {
        enabled: false,
        model: "gpt-4",
        knowledgeBaseId: "",
        promptTemplate: "",
      },
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : "Name is required"),
      description: (value) =>
        value.trim().length > 0 ? null : "Description is required",
      workflow: {
        name: (value) => (value.trim().length > 0 ? null : "Workflow name is required"),
        steps: {
          name: (value) => (value.trim().length > 0 ? null : "Step name is required"),
          description: (value) =>
            value.trim().length > 0 ? null : "Step description is required",
        },
      },
    },
  });

  // Fetch engagement type data
  const fetchEngagementType = useCallback(async (engagementId: string) => {
    setFetchLoading(true);
    setError("");
    
    try {
      // In a real app, this would be an API call
      // Simulate fetching data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in a real app, this would come from your API
      const mockData = {
        id: engagementId,
        name: "Tax Planning Session",
        description: "A comprehensive tax planning session for business clients",
        status: "active",
        estimatedDuration: 60,
        workflow: {
          name: "Tax Planning Workflow",
          steps: [
            {
              name: "Initial Consultation",
              description: "Understand client needs and collect basic information",
              type: "manual",
              estimatedDuration: 15,
            },
            {
              name: "Document Review",
              description: "Review client financial documents",
              type: "manual",
              estimatedDuration: 20,
            },
            {
              name: "Tax Strategy Development",
              description: "Develop personalized tax strategies",
              type: "manual",
              estimatedDuration: 25,
            },
          ],
        },
        roles: ["role-1", "role-4"],
        aiAssist: {
          enabled: true,
          model: "gpt-4",
          knowledgeBaseId: "kb-tax-2023",
          promptTemplate: "You are a tax advisor helping with {{context}}",
        },
      };
      
      // Update form with fetched data
      form.setValues(mockData);
      setFetchLoading(false);
    } catch (error) {
      console.error("Error fetching engagement type:", error);
      setError("Failed to load engagement type data. Please try again.");
      setFetchLoading(false);
    }
  }, [form]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchEngagementType(id);
    }
  }, [id, fetchEngagementType]);

  const handleBack = () => {
    router.push("/applications/engagements");
  };

  const nextStep = () => {
    // Validate current step
    const validateStep = () => {
      if (active === 0) {
        return form.validateField("name").hasError ||
          form.validateField("description").hasError ||
          form.validateField("status").hasError ||
          form.validateField("estimatedDuration").hasError;
      } else if (active === 1) {
        return form.validateField("workflow.name").hasError ||
          form.values.workflow.steps.some((_, i) => 
            form.validateField(`workflow.steps.${i}.name`).hasError ||
            form.validateField(`workflow.steps.${i}.description`).hasError
          );
      }
      return false;
    };

    if (!validateStep()) {
      setActive((current) => (current < 3 ? current + 1 : current));
    }
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const addWorkflowStep = () => {
    form.insertListItem("workflow.steps", {
      name: "",
      description: "",
      type: "manual",
      estimatedDuration: 5,
    });
  };

  const removeWorkflowStep = (index: number) => {
    form.removeListItem("workflow.steps", index);
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    
    try {
      // In a real app, this would be an API call to update the engagement type
      console.log("Updating engagement type with values:", values);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to engagements list after successful update
      router.push("/applications/engagements");
    } catch (error) {
      console.error("Error updating engagement type:", error);
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  // Show loading state while checking authentication or fetching data
  if (status === "loading" || fetchLoading) {
    return (
      <Container size="lg" py="xl">
        <Center style={{ height: "60vh" }}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  // Show error if fetch failed
  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert title="Error" color="red" icon={<IconInfoCircle />}>
          {error}
        </Alert>
        <Button mt="md" onClick={handleBack}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>Configure Engagement Type | Orbit</title>
        <meta name="description" content="Configure an engagement type in Orbit" />
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
            <Title>Configure Engagement Type</Title>
          </Group>
        </Flex>
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Paper shadow="xs" p="lg" radius="md" withBorder mb="xl">
            <Stepper active={active} onStepClick={setActive}>
              <Stepper.Step label="Basic Information" description="Name and details">
                <Box mt="xl">
                  <TextInput
                    label="Name"
                    placeholder="Enter engagement type name"
                    required
                    {...form.getInputProps("name")}
                    mb="md"
                  />
                  
                  <Textarea
                    label="Description"
                    placeholder="Describe this engagement type"
                    required
                    minRows={3}
                    {...form.getInputProps("description")}
                    mb="md"
                  />
                  
                  <Grid>
                    <Grid.Col span={6}>
                      <NumberInput
                        label="Estimated Duration (minutes)"
                        placeholder="30"
                        min={1}
                        step={5}
                        {...form.getInputProps("estimatedDuration")}
                        mb="md"
                      />
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <Select
                        label="Status"
                        data={[
                          { value: "active", label: "Active" },
                          { value: "inactive", label: "Inactive" },
                          { value: "beta", label: "Beta" },
                        ]}
                        {...form.getInputProps("status")}
                        mb="md"
                      />
                    </Grid.Col>
                  </Grid>
                </Box>
              </Stepper.Step>
              
              <Stepper.Step label="Workflow" description="Configure steps">
                <Box mt="xl">
                  <TextInput
                    label="Workflow Name"
                    placeholder="Enter workflow name"
                    required
                    {...form.getInputProps("workflow.name")}
                    mb="lg"
                  />
                  
                  <Text fw={500} mb="md">Workflow Steps</Text>
                  
                  {form.values.workflow.steps.map((step, index) => (
                    <Paper key={index} withBorder p="md" mb="md">
                      <Flex justify="space-between" mb="xs">
                        <Text fw={500}>Step {index + 1}</Text>
                        {form.values.workflow.steps.length > 1 && (
                          <ActionIcon 
                            color="red" 
                            onClick={() => removeWorkflowStep(index)}
                            aria-label="Remove step"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Flex>
                      
                      <TextInput
                        label="Name"
                        placeholder="Step name"
                        required
                        {...form.getInputProps(`workflow.steps.${index}.name`)}
                        mb="md"
                      />
                      
                      <Textarea
                        label="Description"
                        placeholder="Describe what happens in this step"
                        required
                        minRows={2}
                        {...form.getInputProps(`workflow.steps.${index}.description`)}
                        mb="md"
                      />
                      
                      <Grid>
                        <Grid.Col span={6}>
                          <Select
                            label="Type"
                            data={[
                              { value: "manual", label: "Manual" },
                              { value: "automated", label: "Automated" },
                              { value: "decision", label: "Decision Point" },
                            ]}
                            {...form.getInputProps(`workflow.steps.${index}.type`)}
                            mb="md"
                          />
                        </Grid.Col>
                        
                        <Grid.Col span={6}>
                          <NumberInput
                            label="Estimated Duration (minutes)"
                            placeholder="5"
                            min={1}
                            {...form.getInputProps(`workflow.steps.${index}.estimatedDuration`)}
                            mb="md"
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  ))}
                  
                  <Button
                    leftSection={<IconPlus size={16} />}
                    variant="outline"
                    onClick={addWorkflowStep}
                    mb="xl"
                  >
                    Add Step
                  </Button>
                </Box>
              </Stepper.Step>
              
              <Stepper.Step label="Roles & AI" description="Configure participants">
                <Box mt="xl">
                  <Paper withBorder p="lg" mb="lg">
                    <Flex align="center" gap="xs" mb="md">
                      <IconUsers size={20} />
                      <Title order={4}>Roles</Title>
                    </Flex>
                    
                    <MultiSelect
                      label="Assign Roles to this Engagement Type"
                      placeholder="Select roles"
                      data={[
                        { value: "role-1", label: "Tax Advisor" },
                        { value: "role-2", label: "Tax Specialist" },
                        { value: "role-3", label: "Client" },
                        { value: "role-4", label: "Account Manager" },
                        { value: "role-5", label: "Documentation Specialist" },
                      ]}
                      {...form.getInputProps("roles")}
                      mb="md"
                    />
                  </Paper>
                  
                  <Paper withBorder p="lg">
                    <Flex align="center" gap="xs" mb="md">
                      <IconRobot size={20} />
                      <Title order={4}>AI Assistance</Title>
                    </Flex>
                    
                    <Switch
                      label="Enable AI assistance for this engagement type"
                      {...form.getInputProps("aiAssist.enabled", { type: "checkbox" })}
                      mb="md"
                    />
                    
                    {form.values.aiAssist.enabled && (
                      <>
                        <Select
                          label="AI Model"
                          data={[
                            { value: "gpt-4", label: "GPT-4" },
                            { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
                            { value: "claude-3", label: "Claude 3" },
                          ]}
                          {...form.getInputProps("aiAssist.model")}
                          mb="md"
                        />
                        
                        <TextInput
                          label="Knowledge Base ID"
                          placeholder="Enter knowledge base identifier"
                          {...form.getInputProps("aiAssist.knowledgeBaseId")}
                          mb="md"
                        />
                        
                        <Textarea
                          label="Prompt Template"
                          placeholder="Enter the prompt template with {{context}} placeholders"
                          minRows={3}
                          {...form.getInputProps("aiAssist.promptTemplate")}
                          mb="md"
                        />
                      </>
                    )}
                  </Paper>
                </Box>
              </Stepper.Step>
              
              <Stepper.Step label="Review" description="Confirm details">
                <Box mt="xl">
                  <Paper shadow="xs" p="lg" radius="md" withBorder mb="xl">
                    <Title order={3} mb="md">Review Engagement Type</Title>
                    
                    <Text fw={500} size="sm" mb={5}>Name</Text>
                    <Text mb="md">{form.values.name}</Text>
                    
                    <Text fw={500} size="sm" mb={5}>Description</Text>
                    <Text mb="md">{form.values.description}</Text>
                    
                    <Grid>
                      <Grid.Col span={6}>
                        <Text fw={500} size="sm" mb={5}>Estimated Duration</Text>
                        <Text mb="md">{form.values.estimatedDuration} minutes</Text>
                      </Grid.Col>
                      
                      <Grid.Col span={6}>
                        <Text fw={500} size="sm" mb={5}>Status</Text>
                        <Text mb="md" style={{ textTransform: 'capitalize' }}>{form.values.status}</Text>
                      </Grid.Col>
                    </Grid>
                    
                    <Divider my="md" />
                    
                    <Text fw={500} size="sm" mb={5}>Workflow</Text>
                    <Text mb="md">{form.values.workflow.name} ({form.values.workflow.steps.length} steps)</Text>
                    
                    <Divider my="md" />
                    
                    <Text fw={500} size="sm" mb={5}>Roles</Text>
                    <Flex gap="xs" wrap="wrap" mb="md">
                      {form.values.roles.length > 0 ? (
                        form.values.roles.map((role, index) => (
                          <Chip key={index} checked={false} variant="filled">
                            {role}
                          </Chip>
                        ))
                      ) : (
                        <Text size="sm" c="dimmed">No roles selected</Text>
                      )}
                    </Flex>
                    
                    <Divider my="md" />
                    
                    <Text fw={500} size="sm" mb={5}>AI Assistance</Text>
                    <Text mb="md">{form.values.aiAssist.enabled ? "Enabled" : "Disabled"}</Text>
                    {form.values.aiAssist.enabled && (
                      <>
                        <Text size="sm" mb="md">Model: {form.values.aiAssist.model}</Text>
                      </>
                    )}
                  </Paper>
                </Box>
              </Stepper.Step>
            </Stepper>
            
            <Group justify="space-between" mt="xl">
              {active > 0 ? (
                <Button variant="default" onClick={prevStep}>
                  Back
                </Button>
              ) : (
                <Button variant="default" onClick={handleBack}>
                  Cancel
                </Button>
              )}
              
              {active < 3 ? (
                <Button onClick={nextStep} rightSection={<IconArrowRight size={16} />}>
                  Next Step
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  color="blue" 
                  loading={loading}
                  leftSection={<IconCheck size={16} />}
                >
                  Update Engagement Type
                </Button>
              )}
            </Group>
          </Paper>
        </form>
      </Container>
    </>
  );
}

