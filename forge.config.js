export default {
  packagerConfig: {
    asar: true,
    name: "Athena-Proctoring",
    executableName: "athena-proctoring"
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-dmg",
      config: {
        name: "Athena-Proctoring",
        format: "ULFO"
      }
    }
  ]
};
