 const URL = 'https://script.google.com/macros/s/AKfycbzhR-60-AUw2gL6_8ro7Dm3arl0exFNJ0a3n0MYPE-r-s4YwLrJDkJsT31mYk9LqqG92g/exec';
    const allowedLat = 26.48663382600949;
    const allowedLng = 74.63383057745538;
    const radius = 0.2;

    const msg = document.getElementById('msg');
    const idBox = document.getElementById('idBox');
    const inBtn = document.getElementById('inBtn');
    const outBtn = document.getElementById('outBtn');

    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
      return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    }

    // 📍 Check location on page load
    window.onload = () => {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = getDistance(lat, lng, allowedLat, allowedLng);

        if (dist <= radius) {
          msg.innerHTML = "✅ Location Matched!";
          idBox.disabled = false;
          inBtn.disabled = false;
          outBtn.disabled = false;
        } else {
          msg.innerHTML = "❌ You are not at the allowed location.";
        }
      }, () => {
        msg.innerHTML = "❌ Location permission denied.";
      });
    };

    async function submitAttendance(status) {
      const id = idBox.value.trim();
      if (!id) {
        msg.innerHTML = '❌ Please enter ID.';
        return;
      }

      navigator.geolocation.getCurrentPosition(async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = getDistance(lat, lng, allowedLat, allowedLng);

        if (dist > radius) {
          msg.innerHTML = '❌ You are not at the allowed location.';
          return;
        }

        const formData = new URLSearchParams();
        formData.append('ID', id);
        formData.append('Status', status);
        formData.append('Location', `${lat},${lng}`);

        try {
          const res = await fetch(URL, {
            method: 'POST',
            body: formData
          });

          const data = await res.json();

          if (data.result === 'success') {
            msg.innerHTML = `✅ Hello ${data.name}! ${status} marked at ${data.time}`;
          } else if (data.result === 'already_done') {
            msg.innerHTML = `⚠️ ${status} already submitted today.`;
          } else {
            msg.innerHTML = `❌ ${data.message || 'Unknown Error'}`;
          }

        } catch (err) {
          msg.innerHTML = `❌ Fetch error`;
        }

      }, () => {
       msg.innerHTML = `
  📍 Your Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}<br>
  ✅ Allowed Location: ${allowedLat.toFixed(6)}, ${allowedLng.toFixed(6)}<br>
  📏 Distance: ${dist.toFixed(3)} km
`;

      });
      
    }