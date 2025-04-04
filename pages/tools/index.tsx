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
  ThemeIcon,
  Paper,
} from "@mantine/core";
import { useRouter } from "next/router";
import Head from 'next/head';
import { 
  IconUserCog, 
  IconDeviceAnalytics, 
  IconBellRinging, 
  IconChecklist,
  IconPlus
} from '@tabler/icons-react';

type ToolTab =   'workflows' | 'roles' | 'notificationTemplates' | 'tasks';

interface ToolCategory {
  id: ToolTab;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  emptyStateText: string;
  buttonText: string;
  onButtonClick: () => void;
}

export default function Tools() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Get current path to determine active tab
  const currentPath = router.pathname;
  const activePath = currentPath === '/tools' ? null :
    currentPath.split('/').pop() as ToolTab;

  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    } else {
      setLoading(false);
    }
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

  const toolCategories: ToolCategory[] = [
    {
      id: 'workflows',
      title: 'Workflows',
      description: 'Create automated processes to streamline your operations',
      icon: <IconDeviceAnalytics size={24} />,
      path: '/tools/workflows',
      emptyStateText: 'No workflows configured. Create your first workflow automation.',
      buttonText: 'Create Workflow',
      onButtonClick: () => console.log('Create workflow clicked')
    },
      {
      id: 'roles',
      title: 'Roles Management',
      description: 'Define user roles and permissions for your organization members',
      icon: <IconUserCog size={24} />,
      path: '/tools/roles',
      emptyStateText: 'No roles configured yet. Create your first role to manage permissions.',
      buttonText: 'Add Role',
      onButtonClick: () => console.log('Add role clicked')
    },
    {
      id: 'notificationTemplates',
      title: 'Notification Templates',
      description: 'Design reusable templates for emails, SMS, and in-app notifications',
      icon: <IconBellRinging size={24} />,
      path: '/tools/notification-templates',
      emptyStateText: 'No notification templates found. Create templates to standardize your communications.',
      buttonText: 'New Template',
      onButtonClick: () => console.log('New template clicked')
    },
    {
      id: 'tasks',
      title: 'Tasks Configuration',
      description: 'Set up task types, assignees, and automation rules',
      icon: <IconChecklist size={24} />,
      path: '/tools/tasks',
      emptyStateText: 'No task configurations available. Set up how tasks work in your system.',
      buttonText: 'Configure Tasks',
      onButtonClick: () => console.log('Configure tasks clicked')
    }
  ];

  // For the default /tools route, show the first tool category
  const currentTool = toolCategories.find(tool =>
    (currentPath === '/tools' && tool.id === 'workflows') ||
    tool.id === activePath
  ) || toolCategories[0];

  return (
    <Container size="lg" py="xl">
      <Head>
        <title>Tools & Configuration | Orbit</title>
        <meta name="description" content="Configure tools and settings for your Orbit workspace" />
      </Head>

      <Flex justify="space-between" align="center" mb="xl">
        <Title>Tools & Configuration</Title>
      </Flex>
      
      <SimpleGrid cols={{ base: 1, md: 4 }} mb="xl">
        {toolCategories.map((category) => (
          <Card 
            key={category.id}
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder
            className={activePath === category.id ? 'active-card' : ''}
            onClick={() => router.push(category.path)}
            style={{ 
              cursor: 'pointer',
              borderColor: activePath === category.id ? 'var(--mantine-color-red-6)' : undefined,
              background: activePath === category.id ? 'var(--mantine-color-red-0)' : undefined
            }}
          >
            <ThemeIcon size="xl" radius="md" variant="light" color="red" mb="sm">
              {category.icon}
            </ThemeIcon>
            <Text fw={500} size="lg" mb="xs">{category.title}</Text>
            <Text size="sm" color="dimmed" lineClamp={2}>
              {category.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      {/*<Paper shadow="xs" p="xl" radius="md" withBorder>*/}
      {/*  <Group justify="space-between" mb="lg">*/}
      {/*    <Box>*/}
      {/*      <Title order={2}>{currentTool.title}</Title>*/}
      {/*      <Text color="dimmed" mt="xs">{currentTool.description}</Text>*/}
      {/*    </Box>*/}
      {/*    <Button*/}
      {/*      leftIcon={<IconPlus size={16} />}*/}
      {/*      color="red"*/}
      {/*      onClick={currentTool.onButtonClick}*/}
      {/*    >*/}
      {/*      {currentTool.buttonText}*/}
      {/*    </Button>*/}
      {/*  </Group>*/}

      {/*  <Card shadow="sm" padding="xl" radius="md" withBorder>*/}
      {/*    <Center py="xl" style={{ flexDirection: 'column', gap: '16px', minHeight: '200px' }}>*/}
      {/*      <Text c="dimmed" align="center" mb="md">*/}
      {/*        {currentTool.emptyStateText}*/}
      {/*      </Text>*/}
      {/*      <Box*/}
      {/*        style={{*/}
      {/*          width: '100%',*/}
      {/*          height: '1px',*/}
      {/*          background: 'var(--mantine-color-gray-3)',*/}
      {/*          margin: '20px 0',*/}
      {/*        }}*/}
      {/*      />*/}
      {/*      <Button*/}
      {/*        variant="outline"*/}
      {/*        color="red"*/}
      {/*        leftIcon={<IconPlus size={16} />}*/}
      {/*        onClick={currentTool.onButtonClick}*/}
      {/*      >*/}
      {/*        {currentTool.buttonText}*/}
      {/*      </Button>*/}
      {/*    </Center>*/}
      {/*  </Card>*/}
      {/*</Paper>*/}
      
      <style jsx global>{`
        .active-card {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }
      `}</style>
    </Container>
  );
}
