// A2UI Demo: Peak Pulse Logic
api.registerHandler('onInit', () => {
  api.log("Peak Pulse Dashboard Started");
  
  // Simulate live updates
  const updateData = () => {
    const currentData = [...(api.state.chartData || [])];
    const newValue = api.random(200, 800);
    currentData.shift();
    currentData.push({ name: "Now", value: newValue });
    api.updateState({ chartData: currentData });
  };
});

api.registerHandler('onButtonClick', (id) => {
  api.vfx.confetti();
  api.log("Action Triggered:", id);
});
