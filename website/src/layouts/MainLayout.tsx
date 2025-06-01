import { Link } from '@heroui/link';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@heroui/navbar';
import { useEffect, useState } from 'react';

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
        <div className="font-bold text-xl">
          Minecraft Modpack Installer
        </div>
      </NavbarBrand>

      <NavbarContent justify="end">
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
