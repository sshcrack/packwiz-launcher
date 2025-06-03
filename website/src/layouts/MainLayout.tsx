import { Link } from '@heroui/link';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@heroui/navbar';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">      <Navbar position="sticky">
      <NavbarBrand>
        <RouterLink to="/" className="font-bold text-xl no-underline text-inherit">
          Minecraft Modpack Installer
        </RouterLink>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <RouterLink to="/guide" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Guide
          </RouterLink>
        </NavbarItem>
        <NavbarItem>
          <Link
            href="https://github.com/sshcrack/packwiz-launcher"
            isExternal
            showAnchorIcon
          >
            GitHub
          </Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>

      <main className="flex-grow">
        {mounted && children}
      </main>

      <footer className="py-6 px-4 bg-gray-100 dark:bg-gray-900 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Modpack Installer Generator.
          Built with <Link href="https://heroui.com" isExternal>HeroUI</Link>.
        </p>
      </footer>
    </div>
  );
}
