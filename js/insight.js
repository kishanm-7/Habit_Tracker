async function loadDailyInsight() {
  const card = document.getElementById('insight-card');
  const textEl = document.getElementById('insight-text');
  const refreshBtn = document.getElementById('refresh-insight');
  
  if (!card || !textEl) return;
  
  card.style.display = 'block';
  
  const today = new Date().toDateString();
  const cacheKey = 'forge_insight_' + today;
  const countKey = 'forge_insight_count_' + today;
  
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    typewriterEffect(textEl, cached);
    return;
  }
  
  const habits = JSON.parse(
    localStorage.getItem('forge_habits') || '[]'
  );
  
  const habitData = habits.map(h => ({
    name: h.name,
    streak: h.streak || 0,
    category: h.category
  }));
  
  try {
    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'YOUR_API_KEY_HERE',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: `You are a habit coach for 
            FORGE app. Analyze this habit data 
            and give ONE specific insight in 
            max 2 sentences. Be direct like a 
            serious coach. No emojis.
            Data: ${JSON.stringify(habitData)}`
          }]
        })
      }
    );
    
    const data = await response.json();
    const insight = data.content[0].text;
    
    localStorage.setItem(cacheKey, insight);
    typewriterEffect(textEl, insight);
    
  } catch (error) {
    const fallback = 'Keep showing up. Consistency beats everything else.';
    typewriterEffect(textEl, fallback);
  }
  
  refreshBtn.addEventListener('click', function() {
    const count = parseInt(
      localStorage.getItem(countKey) || '0'
    );
    if (count >= 3) {
      alert('Max 3 refreshes per day');
      return;
    }
    localStorage.removeItem(cacheKey);
    localStorage.setItem(countKey, count + 1);
    loadDailyInsight();
  });
}

function typewriterEffect(el, text) {
  el.innerHTML = '';
  let i = 0;
  const timer = setInterval(function() {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
    }
  }, 30);
}
