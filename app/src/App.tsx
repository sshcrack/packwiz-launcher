import { CSSProperties, useContext, useMemo } from "react";
import Titlebar from "./components/Titlebar";
import { ModpackConfigContext } from './components/ModpackConfigProvider';
import { ModpackInfo, InstallOptions, InstallProgress } from "./components/installation";
import { useInstallation } from "./hooks";

function App() {
  const { theme, background: blockId } = useContext(ModpackConfigContext);
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
  
  const cardStyle: CSSProperties = {
    backdropFilter: `blur(2px) brightness(${theme === "dark" ? "0.5" : "1.5"})`,
    background: "transparent"
  };

  const background = useMemo(() => {
    return `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.5/assets/minecraft/textures/block/${blockId}.png`;
  }, [blockId]);
  return (
    <div className={`${theme === "dark" && "dark"} h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      <Titlebar />
      <main className="h-full w-full p-6 pb-0" style={{
        backgroundImage: `url(${background})`,
        imageRendering: "pixelated",
        backgroundSize: "8%"
      }}>
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
      </main>
    </div>
  );
}

export default App;
