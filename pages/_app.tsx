import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Header from "../components/header";
import "@mantine/core/styles.css";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import { MantineProvider, ColorSchemeScript, AppShell, Skeleton, Group, Burger } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { useDisclosure } from '@mantine/hooks';
import Image from "next/image";
import React from "react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
    const [opened, { toggle }] = useDisclosure();
  return (
    <>
      <Head>
        <title>Orbit</title>
        <meta name="description" content="Everything moves around you" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <ColorSchemeScript />
      </Head>
      <Analytics />

      <SessionProvider session={session}>
        <MantineProvider
        theme={{
            primaryColor: "red",
            }}
        >
          <ModalsProvider>
              <AppShell
                  header={{ height: 120 }}
                  navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
                  padding="md"
              >
                  <AppShell.Header>
                      <Group h="100%" px="md">
                          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                          <Image
                              src="/orbit.png"
                              width={120}
                              height={100}
                              alt="Orbit Logo"
                          />
                      </Group>
                  </AppShell.Header>
                  <AppShell.Navbar p="md">
                      Navbar
                      {Array(15)
                          .fill(0)
                          .map((_, index) => (
                              <Skeleton key={index} h={28} mt="sm" animate={false} />
                          ))}
                  </AppShell.Navbar>
                  <AppShell.Main><Component {...pageProps} /></AppShell.Main>

              </AppShell>



          </ModalsProvider>
        </MantineProvider>
      </SessionProvider>
    </>
  );
}
