import { useContext, useMemo, useEffect } from "react";
import Titlebar from "./components/Titlebar";
import { ModpackConfigContext } from './components/ModpackConfigProvider';
import { ModpackInfo, InstallOptions, InstallProgress } from "./components/installation";
import { useInstallation } from "./hooks";
import { getCardStyle } from "./styles/MinecraftUI";

function App() {
  const { theme, background: blockId, logo_url } = useContext(ModpackConfigContext);
  const {
    installType,
    setInstallType,
    installPath,
    setInstallPath,
    installing,
    progress,
    progressMessage,
    hasLauncher,
    startInstallation
  } = useInstallation();

  // Set favicon from logo_url if available
  useEffect(() => {
    if (logo_url) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = logo_url;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = logo_url;
        document.head.appendChild(newLink);
      }
    }
  }, [logo_url]);

  const cardStyle = getCardStyle(theme);

  const background = useMemo(() => {
    return `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.5/assets/minecraft/textures/block/${blockId}.png`;
  }, [blockId]);

  return (
    <div className={`${theme === "dark" && "dark"} h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      <Titlebar />
      <main className="h-full w-full p-6 pb-0" style={{
        backgroundImage: `url(${background})`,
        imageRendering: "pixelated",
        backgroundSize: "8%",
        backgroundAttachment: "fixed"
      }}>
        <div className="max-w-5xl mx-auto w-full">
          {/* Modpack Information Section */}
          <ModpackInfo cardStyle={cardStyle} />

          {/* Installation Options or Progress Section */}
          {!installing ? (
            <InstallOptions
              cardStyle={cardStyle}
              installType={installType}
              setInstallType={setInstallType}
              installPath={installPath}
              setInstallPath={setInstallPath}
              startInstallation={startInstallation}
              hasLauncher={hasLauncher}
            />
          ) : (
            <InstallProgress
              cardStyle={cardStyle}
              progress={progress}
              progressMessage={progressMessage}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
