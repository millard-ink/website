const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));
app.use('/fonts', express.static(path.join(__dirname, '../public/fonts')));

// Function to get weather data with improved error handling
async function getWeather() {
  return new Promise((resolve, reject) => {
    https.get('https://api.openweathermap.org/data/2.5/weather?q=London,UK&appid=8168cdf9c07c7dbec35e2f119961acbc&units=metric', (resp) => {
      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => {
        try {
          const weatherData = JSON.parse(data);
          resolve(weatherData);
        } catch (err) {
          reject(new Error('Failed to parse weather data'));
        }
      });
    }).on('error', (err) => {
      reject(new Error('Failed to fetch weather data'));
    });
  });
}

// Function to get GitHub repos
async function getGitHubRepos() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/users/millard-ink/repos',
      headers: { 'User-Agent': 'Node.js' }
    };
    
    https.get(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => {
        try {
          const repos = JSON.parse(data);
          resolve(repos);
        } catch (err) {
          reject(new Error('Failed to parse GitHub data'));
        }
      });
    }).on('error', (err) => {
      reject(new Error('Failed to fetch GitHub data'));
    });
  });
}

app.get('/', async (req, res) => {
  let weather;
  let repos;
  
  try {
    [weather, repos] = await Promise.all([getWeather(), getGitHubRepos()]);
  } catch (err) {
    console.error('Error fetching data:', err);
  }

  const getCurrentTime = () => {
    const date = new Date();
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Europe/London'
    });
  };

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Lawrence Millard</title>
        <link rel="icon" type="image/png" href="https://cdn.glitch.global/48690336-169b-48d5-87d9-06221c1a7992/%F0%9F%91%8B.png">
        <style>
          @font-face {
            font-family: 'SF Pro';
            src: url('https://ls-cdn.b-cdn.net/fonts/sf-pro.otf') format('opentype');
          }

          :root {
            --background: 0 0% 100%;
            --foreground: 240 10% 3.9%;
            --card: 0 0% 100%;
            --card-foreground: 240 10% 3.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 240 10% 3.9%;
            --primary: 142.1 76.2% 36.3%;
            --primary-foreground: 355.7 100% 97.3%;
            --secondary: 240 4.8% 95.9%;
            --secondary-foreground: 240 5.9% 10%;
            --muted: 240 4.8% 95.9%;
            --muted-foreground: 240 3.8% 46.1%;
            --accent: 240 4.8% 95.9%;
            --accent-foreground: 240 5.9% 10%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 0 0% 98%;
            --border: 240 5.9% 90%;
            --input: 240 5.9% 90%;
            --ring: 142.1 76.2% 36.3%;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'SF Pro', sans-serif;
            background: #ffffff;
            color: hsl(var(--foreground));
            line-height: 1.6;
            min-height: 100vh;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 4rem 2rem;
          }

          .hero {
            text-align: center;
            margin-bottom: 4rem;
            position: relative;
          }

          .hero::before {
            content: '';
            position: absolute;
            top: -20%;
            left: -10%;
            right: -10%;
            bottom: -20%;
            background: radial-gradient(circle at center, rgba(142, 71, 45, 0.05), transparent 70%);
            z-index: -1;
          }

          .title {
            font-size: 4rem;
            font-weight: 700;
            color: #000;
            margin-bottom: 1rem;
            opacity: 0;
            animation: fadeIn 1s ease-out forwards;
          }

          .subtitle {
            font-size: 1.5rem;
            color: rgba(0, 0, 0, 0.7);
            margin-bottom: 2rem;
            opacity: 0;
            animation: fadeIn 1s ease-out 0.3s forwards;
          }

          .status-card {
            background: rgba(0, 0, 0, 0.02);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 3rem;
            opacity: 0;
            animation: fadeIn 1s ease-out 0.6s forwards;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          }

          .weather-info {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            font-size: 1.2rem;
            color: #333;
          }

          .weather-icon {
            font-size: 2rem;
          }

          .links {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-bottom: 4rem;
          }

          .link {
            padding: 0.8rem 1.5rem;
            border-radius: 0.5rem;
            background: rgba(0, 0, 0, 0.05);
            color: #333;
            text-decoration: none;
            transition: all 0.3s ease;
            border: 1px solid rgba(0, 0, 0, 0.1);
            font-weight: 500;
          }

          .link:hover {
            background: rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }

          .projects {
            width: 100%;
            max-width: 2xl;
            margin: 0 auto;
            padding: 1.5rem;
            background: #ffffff;
            border-radius: 1.5rem;
            border: 1px solid rgba(0, 0, 0, 0.1);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }

          .project-card {
            position: relative;
            display: flex;
            align-items: start;
            gap: 1.25rem;
            padding: 1.25rem;
            background: #ffffff;
            transition: all 0.3s ease-out;
            border-radius: 1rem;
            border: 1px solid rgba(0, 0, 0, 0.1);
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          }

          .project-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          .project-icon {
            flex-shrink: 0;
            padding: 0.75rem;
            border-radius: 1rem;
            background: linear-gradient(135deg, #f0f0f0, #e6e6e6);
            color: #333;
            border: 1px solid rgba(0, 0, 0, 0.1);
            font-weight: 600;
          }

          .project-content {
            flex: 1;
            min-width: 0;
            padding-top: 0.125rem;
          }

          .project-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
          }

          .project-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
          }

          .project-description {
            font-size: 1rem;
            color: #666;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .project-time {
            font-size: 0.875rem;
            font-weight: 500;
            color: #888;
            margin-top: 0.75rem;
            display: block;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="hero">
            <h1 class="title">Lawrence Millard</h1>
            <div class="subtitle">Developer & Designer</div>
          </div>

          <div class="status-card">
            <div class="weather-info">
              <span>🕒 ${getCurrentTime()}</span>
              <span>•</span>
              <span>${weather ? weather.weather[0].description : 'Loading weather...'} ${weather ? '☁️' : ''}</span>
              <span>•</span>
              <span>${weather ? Math.round(weather.main.temp) : '--'}°C</span>
            </div>
          </div>

          <div class="links">
            <a href="https://x.com/lrsypen" class="link">Twitter</a>
            <a href="https://discord.com/users/1276934328055762975" class="link">Discord</a>
          </div>

          <div class="projects">
            ${repos && repos.length > 0 ? 
              repos.map(repo => {
                const initials = repo.name.split('-').map(word => word[0]).join('').toUpperCase();
                const createdAt = new Date(repo.created_at);
                const timeAgo = Math.round((new Date() - createdAt) / (1000 * 60 * 60 * 24));
                const timeString = timeAgo === 0 ? 'today' : timeAgo === 1 ? 'yesterday' : `${timeAgo} days ago`;
                
                return `
                  <div class="project-card">
                    <div class="project-icon">
                      ${initials}
                    </div>
                    <div class="project-content">
                      <div class="project-header">
                        <h3 class="project-title">GitHub</h3>
                      </div>
                      <p class="project-description">${repo.name}</p>
                      <span class="project-time">${timeString}</span>
                    </div>
                  </div>
                `;
              }).join('') : 
              '<div class="project-card"><p class="project-description">No projects currently</p></div>'
            }
          </div>
        </div>

        <script>
          // Add smooth scroll behavior
          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
              e.preventDefault();
              document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
              });
            });
          });
        </script>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
