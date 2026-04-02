async function initDashboard() {
    try {
        const [channelsResponse, trendsResponse] = await Promise.all([
            fetch('data/channels.json'),
            fetch('data/trends.json')
        ]);

        const channels = await channelsResponse.json();
        const trends = await trendsResponse.json();

        // Update Last Updated
        if (document.getElementById('last-updated')) {
            document.getElementById('last-updated').textContent = new Date(trends.updatedAt).toLocaleString('ko-KR');
        }

        // Render Common Trends
        const insightsGrid = document.getElementById('insights-grid');
        if (insightsGrid) {
            trends.commonInsights.forEach(insight => {
                insightsGrid.innerHTML += `
                    <div class="insight-card">
                        <h3>${insight.topic}</h3>
                        <p>${insight.summary}</p>
                        <small>Mentions: ${insight.mentions}</small>
                    </div>
                `;
            });
        }

        // Render Vanguard Hub (Official News & GitHub)
        const newsList = document.getElementById('official-news-list');
        if (newsList && trends.vanguardHub) {
            trends.vanguardHub.officialAnnouncements.forEach(news => {
                newsList.innerHTML += `
                    <div class="news-item">
                        <span class="lab-tag">${news.lab}</span>
                        <a href="${news.link}" target="_blank" style="text-decoration:none; color:inherit;">
                            <strong>${news.title}</strong>
                        </a>
                        <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.3rem;">${news.date}</p>
                    </div>
                `;
            });
        }

        const repoList = document.getElementById('github-repo-list');
        if (repoList && trends.vanguardHub) {
            trends.vanguardHub.githubStarTracker.forEach(repo => {
                repoList.innerHTML += `
                    <div class="repo-card animate-fade">
                        <div class="repo-header">
                            <div class="repo-info">
                                <h4>${repo.name}</h4>
                                <small style="color:var(--text-secondary);">${repo.desc}</small>
                            </div>
                            <div class="star-count">⭐ ${repo.stars}</div>
                        </div>
                        <div class="repo-summary">
                            ${repo.summary}
                        </div>
                        <div class="repo-insight-box">
                            <strong>Insight:</strong> ${repo.insight}
                        </div>
                        <div class="repo-stats">
                            <small style="font-size:0.6rem; color:var(--text-secondary); text-transform:uppercase;">Growth Momentum</small>
                            <div class="growth-momentum" style="width: 60%; margin-left: 1rem;">
                                <div class="momentum-fill" style="width: ${repo.growth}%;"></div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        // Render Interest Radar (Chart & Bubbles)
        const chartContainer = document.getElementById('chart-container');
        if (chartContainer && trends.strategicAnalysis.popularThemes) {
            trends.strategicAnalysis.popularThemes.forEach(theme => {
                chartContainer.innerHTML += `
                    <div class="bar-row">
                        <div class="bar-label">
                            <span>${theme.name}</span>
                            <span>${theme.score}%</span>
                        </div>
                        <div class="bar-bg">
                            <div class="bar-fill" style="width: ${theme.score}%; background: ${theme.color};"></div>
                        </div>
                    </div>
                `;
            });
        }

        const bubbleCloud = document.getElementById('bubble-cloud');
        if (bubbleCloud && trends.strategicAnalysis.flashpointKeywords) {
            trends.strategicAnalysis.flashpointKeywords.forEach(k => {
                const bubble = document.createElement('span');
                bubble.className = 'bubble';
                bubble.style.fontSize = `${k.size}rem`;
                bubble.innerText = k.word;
                bubble.onclick = () => openFocusView(k.word, trends);
                bubbleCloud.appendChild(bubble);
            });
        }

        // Render Strategic Analysis (Roadmap & Tools)
        const roadmapContainer = document.getElementById('roadmap-container');
        if (roadmapContainer && trends.strategicAnalysis) {
            trends.strategicAnalysis.roadmap2026.forEach(item => {
                roadmapContainer.innerHTML += `
                    <div class="roadmap-item">
                        <div class="roadmap-month">${item.month}</div>
                        <div>
                            <strong>${item.event}</strong>
                            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.3rem;">${item.detail}</p>
                        </div>
                    </div>
                `;
            });
        }

        const toolMatrixBody = document.getElementById('tool-matrix-body');
        if (toolMatrixBody && trends.strategicAnalysis) {
            trends.strategicAnalysis.toolComparison.forEach(t => {
                toolMatrixBody.innerHTML += `
                    <tr>
                        <td style="font-weight:bold; color:var(--accent-blue);">${t.tool}</td>
                        <td><span class="tool-tag">${t.focus}</span></td>
                        <td style="font-size:0.85rem;">${t.strength}</td>
                    </tr>
                `;
            });
        }

        // Render Tools Scroll
        const toolsScroll = document.getElementById('tools-scroll');
        if (toolsScroll) {
            trends.commonTools.forEach(tool => {
                toolsScroll.innerHTML += `
                    <div class="tool-chip">
                        <span>${tool.name}</span>
                        <small style="color: rgba(255,255,255,0.4)">| ${tool.category}</small>
                    </div>
                `;
            });
        }

        const channelsGrid = document.getElementById('channels-grid');
        if (channelsGrid) {
            channels.forEach(channel => {
                channelsGrid.innerHTML += `
                    <a href="./details.html#${channel.id}" class="channel-card">
                        <img src="${channel.avatar}" alt="${channel.name}" class="channel-avatar">
                        <h3>${channel.name}</h3>
                        <p class="handle">${channel.handle}</p>
                        <div class="stats">
                            <span>구독자 ${channel.subscribers}</span> • <span>동영상 ${channel.videos}</span>
                        </div>
                        <p class="desc">${channel.description.substring(0, 70)}...</p>
                        <small style="display:block; margin-top:1rem; opacity:0.6">Insight 보기 →</small>
                    </a>
                `;
            });
        }

    } catch (err) {
        console.error("Error loading dashboard data:", err);
    }
}

function openFocusView(keyword, data) {
    const backdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById('focus-modal');
    const title = document.getElementById('modal-title');
    const videoList = document.getElementById('modal-videos');
    const resourceList = document.getElementById('modal-resources');

    if (!backdrop || !modal) return;

    title.innerText = `Topic Focus: ${keyword}`;
    videoList.innerHTML = '';
    resourceList.innerHTML = '';

    // Search Videos across all channels
    Object.values(data.channelsData).flat().forEach(v => {
        if (v.title.toLowerCase().includes(keyword.toLowerCase()) || 
            v.summary.toLowerCase().includes(keyword.toLowerCase())) {
            videoList.innerHTML += `
                <div class="result-video-card" onclick="window.open('${v.url}', '_blank')">
                    <strong style="color:var(--accent-blue); display:block; margin-bottom:0.5rem;">${v.title}</strong>
                    <p style="font-size:0.75rem; color:var(--text-secondary); line-height:1.4;">${v.summary}</p>
                </div>
            `;
        }
    });

    // Search GitHub & Vanguard
    if (data.vanguardHub) {
        data.vanguardHub.githubStarTracker.forEach(repo => {
            if (repo.name.toLowerCase().includes(keyword.toLowerCase()) || 
                repo.summary.toLowerCase().includes(keyword.toLowerCase()) ||
                repo.desc.toLowerCase().includes(keyword.toLowerCase())) {
                resourceList.innerHTML += `
                    <div class="repo-card" style="margin-bottom:1rem; padding:1rem; border-color:rgba(0,242,254,0.3);">
                        <h4 style="color:var(--accent-blue); font-size:0.9rem;">${repo.name}</h4>
                        <p style="font-size:0.75rem; margin-top:0.4rem; color:var(--text-primary);">${repo.summary}</p>
                    </div>
                `;
            }
        });

        data.vanguardHub.officialAnnouncements.forEach(a => {
            if (a.title.toLowerCase().includes(keyword.toLowerCase()) || 
                a.lab.toLowerCase().includes(keyword.toLowerCase())) {
                resourceList.innerHTML += `
                    <div class="news-item" style="margin-bottom:1rem; border-left: 2px solid var(--accent-blue); padding: 0.5rem; background: rgba(255,255,255,0.02);">
                        <span class="lab-tag" style="font-size: 0.6rem;">${a.lab}</span>
                        <strong style="font-size: 0.8rem;">${a.title}</strong>
                    </div>
                `;
            }
        });
    }

    if (videoList.innerHTML === '') videoList.innerHTML = '<p style="color:var(--text-secondary); font-size: 0.8rem;">No directly related videos found for this topic.</p>';
    if (resourceList.innerHTML === '') resourceList.innerHTML = '<p style="color:var(--text-secondary); font-size: 0.8rem;">No directly related professional resources found.</p>';

    backdrop.style.display = 'block';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeFocusView() {
    const backdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById('focus-modal');
    if (backdrop) backdrop.style.display = 'none';
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

initDashboard();
