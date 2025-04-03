import { authOptions } from "pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prismadb";
import { Prisma } from "@prisma/client";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Head from "next/head";
import {
  Container,
  Group,
  Button,
  Title,
  Text,
  Paper,
  Avatar,
  Divider,
  SimpleGrid,
  Box,
  Card,
  Loader,
  Center,
  Badge,
  Stack,
  ActionIcon,
  Modal,
  TextInput,
  Flex
} from "@mantine/core";
import { IconEdit, IconKey, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

type UserWithFullData = Prisma.UserGetPayload<{
  include: {
    accounts: true
  }
}>;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.statusCode = 403;
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  let userId: string = session.user.id;
  let user: UserWithFullData | null = null;
  user =
    (await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        accounts: true
      }
    })) || null;
  return {
    props: { user }
  };
};

type Props = {
  user: UserWithFullData;
};

const Account: React.FC<Props> = (props) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editName, setEditName] = useState(props.user?.name || "");

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleUpdateProfile = () => {
    // This would update the user's name in a real implementation
    console.log("Update profile with new name:", editName);
    close();
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
        <title>Account Settings | Orbit</title>
        <meta name="description" content="Manage your account settings and profile" />
      </Head>

      <Flex justify="space-between" align="center" mb="xl">
        <Title>Account Settings</Title>
      </Flex>

      <SimpleGrid cols={{ base: 1, md: 4 }} mb="xl">
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{
            cursor: 'pointer',
            borderColor: 'var(--mantine-color-red-6)',
            background: 'var(--mantine-color-red-0)'
          }}
        >
          <Group wrap="nowrap">
            <Avatar 
              size={50} 
              color="red" 
              radius="xl"
              src={props.user.image || undefined}
            >
              {props.user.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Text fw={500} size="lg">{props.user.name}</Text>
              <Text size="sm" color="dimmed">{props.user.email}</Text>
            </Box>
          </Group>
        </Card>
      </SimpleGrid>

      <Paper shadow="xs" p="xl" radius="md" withBorder mb="xl">
        <Title order={3} mb="md">Profile Information</Title>
        <Divider mb="md" />
        
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Box>
            <Text size="sm" weight={500} color="dimmed">Name</Text>
            <Group justify="space-between" mt="xs">
              <Text>{props.user.name}</Text>
              <ActionIcon color="gray" onClick={open}>
                <IconEdit size={16} />
              </ActionIcon>
            </Group>
          </Box>

          <Box>
            <Text size="sm" weight={500} color="dimmed">Email</Text>
            <Group justify="space-between" mt="xs">
              <Text>{props.user.email}</Text>
              <Badge color="green">Verified</Badge>
            </Group>
          </Box>
        </SimpleGrid>
      </Paper>

      <Paper shadow="xs" p="xl" radius="md" withBorder mb="xl">
        <Title order={3} mb="md">Account Security</Title>
        <Divider mb="md" />
        
        <Stack>
          <Button 
            variant="outline" 
            leftIcon={<IconKey size={16} />} 
            fullWidth={false}
          >
            Change Password
          </Button>
          
          <Button 
            variant="outline" 
            leftIcon={<IconSettings size={16} />} 
            fullWidth={false}
          >
            Manage 2FA
          </Button>
          
          <Button 
            color="red" 
            variant="outline"
            leftIcon={<IconLogout size={16} />} 
            onClick={() => signOut()} 
            fullWidth={false}
          >
            Log Out
          </Button>
        </Stack>
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title="Edit Profile"
        centered
      >
        <TextInput
          label="Name"
          placeholder="Your name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          mb="md"
        />
        <Group justify="right">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button color="red" onClick={handleUpdateProfile}>Save Changes</Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default Account;

