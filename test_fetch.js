(async () => {
  const res = await fetch('https://i.mjh.nz/PBS/all.m3u8');
  console.log('Status:', res.status);
  console.log('Body:', res.body !== null ? 'Exists' : 'Null');
})();
