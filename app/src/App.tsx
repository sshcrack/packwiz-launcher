import { CSSProperties, useContext, useMemo, useState } from "react";
import { Button, Card, CardHeader, CardBody, Image, Progress, Select, SelectItem, Input, Checkbox } from '@heroui/react';
import Titlebar from "./components/Titlebar";
import { ModpackConfigContext } from './components/ModpackConfigProvider';
import { open } from '@tauri-apps/plugin-dialog';

function App() {
  const { description, logo_url: logoUrl, title, theme, background: blockId } = useContext(ModpackConfigContext)
  const cardStyle: CSSProperties = {
    backdropFilter: `blur(2px) brightness(${theme === "dark" ? "0.5" : "1.5"})`,
    background: "transparent"
  }
  // State for installation type
  const [installType, setInstallType] = useState("prism");
  const [installPath, setInstallPath] = useState("");
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useCustomInstall, setUseCustomInstall] = useState(false);
  const background = useMemo(() => {
    return `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.5/assets/minecraft/textures/block/${blockId}.png`
  }, [blockId]);

  // Mock installation function
  const startInstallation = () => {
    setInstalling(true);

    // Simulate installation progress
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 5;
      setProgress(progressValue);

      if (progressValue >= 100) {
        clearInterval(interval);
        setInstalling(false);
      }
    }, 500);
  };

  // Handle file/directory selection
  const handlePathSelection = async () => {
    const res = installType === "portable" ?
      await open({
        directory: true,
        multiple: false,
        title: "Select Installation Directory",
      }) :
      await open({
        directory: false,
        multiple: false,
        title: "Select PrismLauncher binary",
        filters: [
          {
            name: "PrismLauncher",
            extensions: ["exe", "app"]
          }
        ]
      })

    if (!res)
      return

    setInstallPath(res);
  };

  return (
    <div className={`${theme === "dark" && "dark"} h-screen w-screen flex flex-col`}>
      <Titlebar />
      <main className="h-full w-full p-6 pb-0" style={{
        backgroundImage: `url(${background})`,
        imageRendering: "pixelated",
        backgroundSize: "8%"
      }}>
        {/* Modpack Information Section */}
        <Card className="mb-8" style={cardStyle}>
          <CardBody className="flex flex-col md:flex-row gap-6 p-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="mb-4">{description}</p>
            </div>
            <div className="flex-shrink-0 flex items-center justify-center">
              <Image
                src={logoUrl}
                alt={`${title} logo`}
                className="max-w-[200px] h-auto"
              />
            </div>
          </CardBody>
        </Card>

        {/* Installation Options Section */}
        {!installing && (
          <Card className="mb-8" style={cardStyle}>
            <CardHeader className="pb-0 pt-6 px-6">
              <h2 className="text-xl font-bold">Installation Options</h2>
            </CardHeader>
            <CardBody className="p-6">
              <div className="mb-6">                <Select
                label="Installation Type"
                placeholder="Select installation type"
                selectedKeys={[installType]}
                onChange={(e) => {
                  setInstallType(e.target.value)
                  setInstallPath("")
                }}
                className="mb-4"
              >
                <SelectItem key="portable">
                  Portable Install
                </SelectItem>
                <SelectItem key="prism">
                  Install to PrismLauncher
                </SelectItem>
              </Select>

                {installType === "prism" && (
                  <Checkbox
                    isSelected={useCustomInstall}
                    onValueChange={setUseCustomInstall}
                    className="mb-4"
                  >
                    Specify custom PrismLauncher location
                  </Checkbox>
                )}

                {(installType === "portable" || (installType === "prism" && useCustomInstall)) && (
                  <div className="flex gap-4 items-center">
                    <Input
                      type="text"
                      readOnly
                      className="flex-1 p-2 pl-0"
                      placeholder={installType === "portable" ? "Choose save directory" : "Select PrismLauncher location"}
                      onClick={handlePathSelection}
                      value={installPath}
                    />
                    <Button onPress={handlePathSelection}>Browse...</Button>
                  </div>
                )}
              </div>              <div className="flex justify-end">
                <Button
                  color="primary"
                  onPress={startInstallation}
                  isDisabled={!installPath && (installType === "portable" || (installType === "prism" && useCustomInstall))}
                >
                  Install
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Installation Progress Section (only shown when installing) */}
        {installing && (
          <Card style={cardStyle}>
            <CardHeader className="pb-0 pt-6 px-6">
              <h2 className="text-xl font-bold">Installing...</h2>
            </CardHeader>
            <CardBody className="p-6">
              <Progress
                value={progress}
                className="mb-2"
                color="primary"
                size="lg"
                showValueLabel={true}
              />
              <p className="text-center text-gray-600">
                {progress < 100 ?
                  `Downloading and installing modpack (${progress}%)` :
                  "Installation complete!"}
              </p>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}

export default App;
