/**
 * Component metadata for the 3D inspector cards.
 * Each entry provides educational info displayed when a component is clicked.
 */

export interface InspectorMeta {
  id: string;
  name: string;
  description: string;
  parameters: { label: string; key: string; unit: string; format?: (v: number) => string }[];
  /** Which soft control card to open, if any */
  controlCard?: "rod" | "boron" | "pump";
  educationalNote?: string;
}

export const INSPECTOR_DATA: Record<string, InspectorMeta> = {
  vessel: {
    id: "vessel",
    name: "Reactor Pressure Vessel",
    description:
      "The RPV contains the reactor core, control rod assemblies, and supporting internals. It is made of low-alloy steel with stainless steel cladding, designed for ~155 bar operating pressure.",
    parameters: [
      { label: "Power", key: "P", unit: "%", format: (v) => (v * 100).toFixed(1) },
      { label: "Fuel Temp", key: "Tf", unit: "K", format: (v) => v.toFixed(0) },
      { label: "Coolant Temp", key: "Tc", unit: "K", format: (v) => v.toFixed(0) },
    ],
    educationalNote:
      "The vessel is designed to last the full 60-year life of the plant. Embrittlement from neutron irradiation is the primary aging concern.",
  },
  core: {
    id: "core",
    name: "Reactor Core",
    description:
      "The core contains ~193 fuel assemblies with UO2 fuel rods in a 17x17 lattice. Nuclear fission produces 3000 MWth at full power. Power is controlled by rod position, boron concentration, and inherent feedback.",
    parameters: [
      { label: "Power", key: "P", unit: "%", format: (v) => (v * 100).toFixed(1) },
      { label: "Total Reactivity", key: "rhoTotal", unit: "pcm", format: (v) => (v * 1e5).toFixed(0) },
    ],
    educationalNote:
      "The chain reaction is self-regulating: as temperature increases, reactivity decreases (negative feedback). This is the most important safety feature of a PWR.",
  },
  rods: {
    id: "rods",
    name: "Control Rod Assemblies",
    description:
      "Control rods contain neutron-absorbing material (Ag-In-Cd or B4C). Inserting rods absorbs more neutrons and reduces reactivity. Rod worth follows an S-curve: more effect in the middle of the core.",
    parameters: [
      { label: "Rod Position", key: "rodActual", unit: "%", format: (v) => (v * 100).toFixed(1) },
      { label: "Rod Worth", key: "rhoExt", unit: "pcm", format: (v) => (v * 1e5).toFixed(0) },
    ],
    controlCard: "rod",
    educationalNote:
      "In an emergency, rods are released and fall by gravity in ~2 seconds (SCRAM). The word comes from the first reactor's Safety Control Rod Ax Man.",
  },
  pump: {
    id: "pump",
    name: "Reactor Coolant Pump",
    description:
      "The RCP forces primary coolant through the core to remove heat. Forced circulation provides ~6x better heat transfer than natural circulation alone.",
    parameters: [
      { label: "Coolant Temp", key: "Tc", unit: "K", format: (v) => v.toFixed(0) },
    ],
    controlCard: "pump",
    educationalNote:
      "A pump trip is a significant event: reduced cooling can cause temperatures to rise rapidly. Natural circulation can maintain decay heat removal after shutdown.",
  },
  "sg-a": {
    id: "sg-a",
    name: "Steam Generator A",
    description:
      "U-tube heat exchanger transferring heat from primary (radioactive) to secondary (non-radioactive) coolant. The tubes provide the pressure boundary between the two systems.",
    parameters: [
      { label: "Hot Leg Temp", key: "Tc", unit: "K", format: (v) => v.toFixed(0) },
    ],
    educationalNote:
      "Each SG has thousands of thin tubes with ~11,000 m2 of heat transfer area. Tube degradation is a major maintenance concern.",
  },
  "sg-b": {
    id: "sg-b",
    name: "Steam Generator B",
    description:
      "Second steam generator loop providing redundant heat removal. In normal operation, both SGs share the thermal load equally.",
    parameters: [
      { label: "Hot Leg Temp", key: "Tc", unit: "K", format: (v) => v.toFixed(0) },
    ],
  },
  pressurizer: {
    id: "pressurizer",
    name: "Pressurizer",
    description:
      "Maintains RCS pressure at ~155 bar using electric heaters (to increase) and spray (to decrease). Contains a steam bubble above liquid water for pressure control.",
    parameters: [
      { label: "Coolant Temp", key: "Tc", unit: "K", format: (v) => v.toFixed(0) },
    ],
    controlCard: "boron",
    educationalNote:
      "The pressurizer is the only place in the RCS where boiling is intentional. The CVCS injects/removes borated water through the pressurizer.",
  },
  turbine: {
    id: "turbine",
    name: "Turbine-Generator",
    description:
      "Converts steam thermal energy to electrical energy. The HP turbine receives steam directly from the SGs; LP turbines handle expanded steam after moisture separation.",
    parameters: [
      { label: "Power", key: "P", unit: "%", format: (v) => (v * 100).toFixed(1) },
    ],
    educationalNote:
      "A 1000 MWe plant converts ~33% of thermal energy to electricity. The remaining 67% is rejected as waste heat to the environment.",
  },
  containment: {
    id: "containment",
    name: "Containment Building",
    description:
      "The containment is the final barrier preventing radioactive release. The reinforced concrete and steel liner are designed to withstand the maximum credible accident pressure.",
    parameters: [],
    educationalNote:
      "Containment is tested periodically to ensure leak-tightness. It must maintain integrity during design-basis accidents including a full LOCA.",
  },
  hotleg: {
    id: "hotleg",
    name: "Hot Leg",
    description: "Carries heated coolant from the reactor vessel to the steam generators. Typical temperature ~325°C at full power.",
    parameters: [
      { label: "Coolant Temp", key: "Tc", unit: "K", format: (v) => v.toFixed(0) },
    ],
  },
  coldleg: {
    id: "coldleg",
    name: "Cold Leg",
    description: "Returns cooled coolant from the steam generators back to the reactor vessel via the RCP. Typical temperature ~290°C at full power.",
    parameters: [
      { label: "Coolant Temp", key: "Tc", unit: "K", format: (v) => v.toFixed(0) },
    ],
  },
};
