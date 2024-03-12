document.addEventListener('DOMContentLoaded', function() {
    const labelButtonsContainer = document.getElementById('label-buttons');
    const customLabelInput = document.getElementById('custom-label');
    const addCustomLabelButton = document.getElementById('add-custom-label');
    const textContentInput = document.getElementById('text-content');
    const autoDetectButton = document.getElementById('auto-detect');
    const generateChartButton = document.getElementById('generate-chart');
    const chartContainer = document.getElementById('chart-container');
    const returnButton = document.getElementById('return-button'); 

    const labelCounts = {
        "科技创新与发展": 0,
        "网络安全与隐私": 0,
        "环境保护与气候变化": 0,
        "经济发展与贸易": 0,
        "社会问题与民生关注": 0,
        "文化娱乐": 0,
        "政治事件与国际关系": 0
    };

    Object.keys(labelCounts).forEach(label => {
        const button = document.createElement('button');
        button.classList.add('label-btn');
        button.textContent = label;
        button.addEventListener('click', () => incrementCount(label));
        labelButtonsContainer.appendChild(button);
    });

    addCustomLabelButton.addEventListener('click', addCustomLabel);
    customLabelInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addCustomLabel();
        }
    });

    autoDetectButton.addEventListener('click', autoDetectAndIncrement);

    generateChartButton.addEventListener('click', generateBarChart);

    returnButton.addEventListener('click', function() {
        chartContainer.style.display = 'none'; 
        showElements(); 
        returnButton.style.display = 'none'; 
    });

    const customAiButtonBottom = document.getElementById('custom-ai-button');
    customAiButtonBottom.addEventListener('click', promptForCustomChatGPTDetails);

    async function promptForCustomChatGPTDetails() {
        const useCustom = confirm('是否要使用自定义的 ChatGPT API 和 Prompt?');

        if (useCustom) {
            const apiKey = prompt('请输入 ChatGPT 的 API:');
            const promptText = prompt('请输入 ChatGPT 的 prompt:');
            const model = prompt('请输入指定要使用的 ChatGPT 模型（例如：text-davinci-002）:');

            if (apiKey && promptText && model) {
                await autoDetectAndIncrement(apiKey, promptText, model);
            } else {
                alert('请输入有效的 API、prompt 和 ChatGPT 模型');
            }
        } else {
            await autoDetectAndIncrement(); 
        }
    }

    function incrementCount(label) {
        labelCounts[label]++;
        alert("已统计 " + label);
    }

    function addCustomLabel() {
        const customLabel = customLabelInput.value.trim();
        if (customLabel !== '') {
            labelCounts[customLabel] = 0;
            alert("已添加自定义标签：" + customLabel);

            const button = document.createElement('button');
            button.classList.add('label-btn');
            button.textContent = customLabel;
            button.addEventListener('click', () => incrementCount(customLabel));
            labelButtonsContainer.appendChild(button);
        } else {
            alert("请输入自定义标签");
        }
    }

    async function autoDetectAndIncrement(apiKey = null, promptText = null, model = null) {
        if (!apiKey || !promptText) {
            const promptUrl = 'prompt.txt';
            const apiUrl = 'api.txt';

            const [promptResponse, apiResponse] = await Promise.all([fetch(promptUrl), fetch(apiUrl)]);
            if (!promptResponse.ok || !apiResponse.ok) {
                throw new Error('无法获取数据');
            }
            const [prompt, apiKey] = await Promise.all([promptResponse.text(), apiResponse.text()]);
            apiKey = apiKey.trim();
            promptText = prompt.trim();
        }

        const textContent = textContentInput.value.trim();
        const detectedLabels = await detectLabels(textContent, apiKey, promptText, model);

        if (detectedLabels.length > 0) {
            detectedLabels.forEach(label => {
                labelCounts[label]++;
                alert("已识别并统计为：" + label);
            });
        } else {
            alert("无法识别标签");
        }
    }

    async function detectLabels(text, apiKey = null, promptText = null, model = null) {
        if (!apiKey || !promptText) {
            const promptUrl = 'prompt.txt';
            const apiUrl = 'api.txt';

            const [promptResponse, apiResponse] = await Promise.all([fetch(promptUrl), fetch(apiUrl)]);
            if (!promptResponse.ok || !apiResponse.ok) {
                throw new Error('无法获取数据');
            }

            const [prompt, apiKey] = await Promise.all([promptResponse.text(), apiResponse.text()]);
            apiKey = apiKey.trim();
            promptText = prompt.trim();
        }

        const response = await fetch('https://api.openai.com/v1/ai/text-completion/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'text-davinci-002', 
                prompt: promptText + '\n' + text,
                max_tokens: 1
            })
        });

        if (!response.ok) {
            throw new Error('无法响应 ChatGPT API');
        }

        const data = await response.json();
        const detectedLabel = data.choices[0].text.trim();
        return [detectedLabel];
    }

    function generateBarChart() {
        const labels = Object.keys(labelCounts);
        const counts = Object.values(labelCounts);

        const ctx = document.createElement('canvas');
        ctx.id = 'chart';
        chartContainer.innerHTML = '';
        chartContainer.appendChild(ctx);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '近期阅读标签统计',
                    data: counts,
                    backgroundColor: '#4CAF50', // 修改柱形颜色
                    borderWidth: 1, // 边框宽度
                    borderColor: '#777', // 边框颜色
                    hoverBorderWidth: 2, // 鼠标悬停时边框宽度
                    hoverBorderColor: '#000' // 鼠标悬停时边框颜色
                }]
            },
            options: {
                animation: {
                    duration: 1500, // 添加动画效果，持续时间为1.5秒
                    easing: 'easeInOutQuart' // 缓动函数
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            fontColor: '#333', // 刻度颜色
                            fontSize: 14 // 刻度字体大小
                        },
                        gridLines: {
                            color: 'rgba(0, 0, 0, 0.1)' // 网格线颜色
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontColor: '#333', // 刻度颜色
                            fontSize: 14 // 刻度字体大小
                        },
                        gridLines: {
                            display: false // 隐藏垂直网格线
                        }
                    }]
                },
                legend: {
                    display: false // 隐藏图例
                }
            }
        });

        hideElements();
        chartContainer.style.display = 'block';
        returnButton.style.display = 'block';
    }

    function hideElements() {
        labelButtonsContainer.style.display = 'none';
        customLabelInput.style.display = 'none';
        addCustomLabelButton.style.display = 'none';
        textContentInput.style.display = 'none';
        autoDetectButton.style.display = 'none';
        generateChartButton.style.display = 'none';
        customAiButtonBottom.style.display = 'none';
    }

    function showElements() {
        labelButtonsContainer.style.display = 'block';
        customLabelInput.style.display = 'block';
        addCustomLabelButton.style.display = 'block';
        textContentInput.style.display = 'block';
        autoDetectButton.style.display = 'block';
        generateChartButton.style.display = 'block';
        customAiButtonBottom.style.display = 'block';
    }
});
