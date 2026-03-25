api.registerHandler('onInit', async () => {
  api.updateState({ status: 'Connecting...', data: null, dbValue: null });
  
  try {
    // 1. Test Fetch (Whitelist check: api.coindesk.com should be allowed)
    api.log('Testing Fetch...');
    const btcData = await api.fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
    api.log('Fetch Success:', btcData.chartName);
    
    // 2. Test DB Add
    api.log('Testing DB Add...');
    await api.db.addRow('last_btc_price', { 
      price: btcData.bpi.USD.rate, 
      time: btcData.time.updated 
    });
    
    // 3. Test DB Get
    api.log('Testing DB Get...');
    const saved = await api.db.getRow('last_btc_price');
    
    api.updateState({ 
      status: 'Connected & Saved!', 
      data: btcData.bpi.USD.rate,
      dbValue: saved.price
    });
    api.vfx.confetti();
  } catch (err) {
    api.log('Test Error:', err.message);
    api.updateState({ status: 'Error: ' + err.message });
  }
});
