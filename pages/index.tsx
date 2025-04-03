// * NEXTAUTH
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  Image, 
  Text, 
  Card, 
  Center, 
  Loader, 
  Container, 
  Grid, 
  Title, 
  Group, 
  Button,
  SimpleGrid,
  Box,
  ThemeIcon,
  Paper,
  Stack,
  Divider,
  Avatar
} from "@mantine/core";
import { 
  IconApps, 
  IconTools, 
  IconUserCog, 
  IconUsers, 
  IconBuildingStore,
  IconArrowRight
} from '@tabler/icons-react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Page() {
  const {data: session, status: loading} = useSession();
  const router = useRouter();

  if(loading === 'loading') {
    return (
        <Center>
          <Loader color="red" size="lg" />
        </Center>
    );
  }

  if (session) {
    return (
      <>
        <Head>
          <title>Welcome to Orbit</title>
          <meta name="description" content="Configure and manage your Orbit workspace" />
        </Head>
        <Container size="lg" py="xl">
          <Paper shadow="sm" p="xl" radius="md" withBorder mb="xl">
            <Group justify="apart" mb="md">
              <Box>
                <Title order={2}>Welcome to Orbit</Title>
                <Text color="dimmed" mt="xs">
                  Your central platform for customer data and engagement
                </Text>
              </Box>
            </Group>
            <Divider mb="xl" />
            
            <Title order={3} mb="lg">Configuration Guide</Title>
            
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <ThemeIcon size="xl" radius="md" variant="light" color="red" mb="md">
                  <IconApps size={24} />
                </ThemeIcon>
                <Text fw={500} size="lg" mb="xs">Applications</Text>
                <Text size="sm" color="dimmed" mb="lg">
                  Set up and configure the applications you need for your workflows
                </Text>
                <Button 
                  variant="light" 
                  color="red" 
                  rightIcon={<IconArrowRight size={16} />} 
                  onClick={() => router.push('/applications')}
                  fullWidth
                >
                  Manage Applications
                </Button>
              </Card>
              
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <ThemeIcon size="xl" radius="md" variant="light" color="red" mb="md">
                  <IconTools size={24} />
                </ThemeIcon>
                <Text fw={500} size="lg" mb="xs">Tools & Configuration</Text>
                <Text size="sm" color="dimmed" mb="lg">
                  Configure roles, workflows, notifications, and task management
                </Text>
                <Button 
                  variant="light" 
                  color="red" 
                  rightIcon={<IconArrowRight size={16} />} 
                  onClick={() => router.push('/tools')}
                  fullWidth
                >
                  Access Tools
                </Button>
              </Card>
              
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <ThemeIcon size="xl" radius="md" variant="light" color="red" mb="md">
                  <IconUserCog size={24} />
                </ThemeIcon>
                <Text fw={500} size="lg" mb="xs">Account Settings</Text>
                <Text size="sm" color="dimmed" mb="lg">
                  Manage your profile, security settings, and preferences
                </Text>
                <Button 
                  variant="light" 
                  color="red" 
                  rightIcon={<IconArrowRight size={16} />} 
                  onClick={() => router.push('/account')}
                  fullWidth
                >
                  Edit Profile
                </Button>
              </Card>
            </SimpleGrid>
            
            <Paper shadow="xs" p="xl" radius="md" withBorder>
              <Title order={3} mb="md">Getting Started</Title>
              <Stack>
                <Group>
                  <ThemeIcon radius="xl" size="lg" variant="light" color="red">
                    <Text fw={700}>1</Text>
                  </ThemeIcon>
                  <Text>Create and configure your first application</Text>
                </Group>
                <Group>
                  <ThemeIcon radius="xl" size="lg" variant="light" color="red">
                    <Text fw={700}>2</Text>
                  </ThemeIcon>
                  <Text>Set up user roles and permissions</Text>
                </Group>
                <Group>
                  <ThemeIcon radius="xl" size="lg" variant="light" color="red">
                    <Text fw={700}>3</Text>
                  </ThemeIcon>
                  <Text>Create notification templates and workflows</Text>
                </Group>
                <Group>
                  <ThemeIcon radius="xl" size="lg" variant="light" color="red">
                    <Text fw={700}>4</Text>
                  </ThemeIcon>
                  <Text>Configure task management settings</Text>
                </Group>
              </Stack>
              <Group justify="right" mt="xl">
                <Button 
                  color="red" 
                  onClick={() => router.push('/applications/new')}
                >
                  Start Setup
                </Button>
              </Group>
            </Paper>
          </Paper>
        </Container>
      </>
    );
  }
  else {
    return (
      <>
        <Container>
          <Text
            size="lg"
            fw={800}
            ta="center"
            variant="gradient"
            gradient={{from: 'red', to: 'maroon', deg: 90}}
          >Login to start building your tenant!</Text>
        </Container>
      </>
    );
  }
}

