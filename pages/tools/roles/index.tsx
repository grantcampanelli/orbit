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
  Modal,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useRouter } from "next/router";
import Head from 'next/head';
import { IconUserCog, IconPlus } from '@tabler/icons-react';

const mockRoles = [
  { id: 1, name: "Admin", description: "Full access to all settings" },
  { id: 2, name: "Editor", description: "Can edit content" },
  { id: 3, name: "Viewer", description: "Can view content" },
];

export default function Roles() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState(mockRoles);
  const [modalOpened, setModalOpened] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    } else {
      setLoading(false);
    }
  }, [status]);

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (status === "loading" || loading) {
    return (
      <Container size="lg" py="xl">
        <Center style={{ height: "60vh" }}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  const handleAddRole = () => {
    const newRole = {
      id: roles.length + 1,
      name: newRoleName,
      description: newRoleDescription,
    };
    setRoles([...roles, newRole]);
    setModalOpened(false);
    setNewRoleName("");
    setNewRoleDescription("");
  };

  return (
    <Container size="lg" py="xl">
      <Head>
        <title>Roles Management | Orbit</title>
        <meta name="description" content="Manage user roles and permissions for your Orbit workspace" />
      </Head>

      <Flex justify="space-between" align="center" mb="xl">
        <Title>Roles Management</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          color="red"
          onClick={() => setModalOpened(true)}
        >
          Add Role
        </Button>
      </Flex>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Add New Role"
      >
        <TextInput
          label="Role Name"
          placeholder="Enter role name"
          value={newRoleName}
          onChange={(event) => setNewRoleName(event.currentTarget.value)}
          required
        />
        <Textarea
          label="Role Description"
          placeholder="Enter role description"
          value={newRoleDescription}
          onChange={(event) => setNewRoleDescription(event.currentTarget.value)}
          required
          mt="md"
        />
        <Button
          fullWidth
          mt="md"
          color="red"
          onClick={handleAddRole}
        >
          Add Role
        </Button>
      </Modal>

      <Paper shadow="xs" p="xl" radius="md" withBorder>
        {roles.length > 0 ? (
          <SimpleGrid cols={3} spacing="lg">
            {roles.map((role) => (
              <Card key={role.id} shadow="sm" padding="xl" radius="md" withBorder>
                <Group mb="xs">
                  <Text weight={500}>{role.name}</Text>
                  <ThemeIcon color="red" variant="light">
                    <IconUserCog size={18} />
                  </ThemeIcon>
                </Group>
                <Text size="sm" color="dimmed">
                  {role.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Center py="xl" style={{ flexDirection: 'column', gap: '16px', minHeight: '200px' }}>
            <Text c="dimmed" align="center" mb="md">
              No roles configured yet. Create your first role to manage permissions.
            </Text>
            <Box
              style={{
                width: '100%',
                height: '1px',
                background: 'var(--mantine-color-gray-3)',
                margin: '20px 0',
              }}
            />
            <Button
              variant="outline"
              color="red"
              leftIcon={<IconPlus size={16} />}
              onClick={() => setModalOpened(true)}
            >
              Add Role
            </Button>
          </Center>
        )}
      </Paper>
    </Container>
  );
}
