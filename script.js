// 考试数据存储
let exams = [];
let currentExamIndex = -1;
let countdownInterval = null;

// DOM元素
const countdownSection = document.getElementById('countdownSection');
const countdownEmpty = document.getElementById('countdownEmpty');
const countdownDisplay = document.getElementById('countdownDisplay');
const examNameEl = document.getElementById('examName');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const examDateEl = document.getElementById('examDate');
const examsList = document.getElementById('examsList');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('closeBtn');
const examForm = document.getElementById('examForm');
const examNameInput = document.getElementById('examNameInput');
const examDateInput = document.getElementById('examDateInput');
const examTimeInput = document.getElementById('examTimeInput');

// 初始化
function init() {
    loadExams();
    renderExamList();
    if (exams.length > 0) {
        selectExam(0);
    }
}

// 从localStorage加载考试数据
function loadExams() {
    const saved = localStorage.getItem('exams');
    if (saved) {
        exams = JSON.parse(saved);
    }
}

// 保存考试数据到localStorage
function saveExams() {
    localStorage.setItem('exams', JSON.stringify(exams));
}

// 渲染考试列表
function renderExamList() {
    if (exams.length === 0) {
        examsList.innerHTML = '<div class="no-exams">暂无考试记录</div>';
        return;
    }

    examsList.innerHTML = exams.map((exam, index) => `
        <div class="exam-card ${index === currentExamIndex ? 'active' : ''}" data-index="${index}">
            <div class="exam-card-info">
                <div class="exam-card-name">${exam.name}</div>
                <div class="exam-card-time">${exam.date} ${exam.time}</div>
            </div>
            <div class="exam-card-countdown">${getCountdownText(exam)}</div>
            <button class="exam-card-delete" onclick="deleteExam(${index})">删除</button>
        </div>
    `).join('');

    // 添加点击事件
    document.querySelectorAll('.exam-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('exam-card-delete')) {
                const index = parseInt(card.dataset.index);
                selectExam(index);
            }
        });
    });
}

// 获取倒计时文本
function getCountdownText(exam) {
    const now = new Date();
    const examTime = new Date(`${exam.date}T${exam.time}`);
    const diff = examTime - now;

    if (diff <= 0) {
        return '已过期';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return `${days}天 ${hours}时`;
    } else if (hours > 0) {
        return `${hours}时 ${minutes}分`;
    } else {
        return `${minutes}分钟`;
    }
}

// 选择考试
function selectExam(index) {
    if (index < 0 || index >= exams.length) return;

    currentExamIndex = index;
    const exam = exams[index];

    // 更新倒计时显示
    countdownEmpty.style.display = 'none';
    countdownDisplay.style.display = 'block';
    examNameEl.textContent = exam.name;
    examDateEl.textContent = `考试时间：${exam.date} ${exam.time}`;

    // 更新考试列表高亮
    document.querySelectorAll('.exam-card').forEach((card, i) => {
        card.classList.toggle('active', i === index);
    });

    // 启动倒计时
    startCountdown(exam);
}

// 启动倒计时
function startCountdown(exam) {
    // 清除之前的定时器
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    updateCountdown(exam);
    
    countdownInterval = setInterval(() => {
        updateCountdown(exam);
    }, 1000);
}

// 更新倒计时显示
function updateCountdown(exam) {
    const now = new Date();
    const examTime = new Date(`${exam.date}T${exam.time}`);
    const diff = examTime - now;

    if (diff <= 0) {
        updateTimeValues({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        examNameEl.textContent = `${exam.name} - 考试已开始！`;
        clearInterval(countdownInterval);
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    updateTimeValues({ days, hours, minutes, seconds });
}

// 更新时间数字并添加动画
function updateTimeValues(values) {
    const elements = {
        days: daysEl,
        hours: hoursEl,
        minutes: minutesEl,
        seconds: secondsEl
    };

    for (const [key, el] of Object.entries(elements)) {
        const newValue = String(values[key]).padStart(2, '0');
        if (el.textContent !== newValue) {
            // 添加更新动画
            el.classList.add('updating');
            
            // 等待动画完成后更新值
            setTimeout(() => {
                el.textContent = newValue;
                el.classList.remove('updating');
            }, 150);
        }
    }
}

// 添加考试
function addExam(name, date, time) {
    const exam = {
        id: Date.now(),
        name,
        date,
        time
    };
    
    exams.push(exam);
    saveExams();
    renderExamList();
    
    // 自动选择新添加的考试
    selectExam(exams.length - 1);
}

// 删除考试
function deleteExam(index) {
    if (confirm('确定要删除这个考试吗？')) {
        exams.splice(index, 1);
        saveExams();
        
        if (currentExamIndex === index) {
            // 如果删除的是当前选中的考试
            if (exams.length === 0) {
                // 没有考试了
                currentExamIndex = -1;
                countdownEmpty.style.display = 'block';
                countdownDisplay.style.display = 'none';
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                }
            } else {
                // 选择下一个或上一个
                const newIndex = Math.min(index, exams.length - 1);
                selectExam(newIndex);
            }
        } else if (currentExamIndex > index) {
            // 如果当前选中的考试在被删除考试之后，索引减1
            currentExamIndex--;
        }
        
        renderExamList();
    }
}

// 事件监听
addBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    // 设置默认日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    examDateInput.value = tomorrow.toISOString().split('T')[0];
    examTimeInput.value = '09:00';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    examForm.reset();
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        examForm.reset();
    }
});

examForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = examNameInput.value.trim();
    const date = examDateInput.value;
    const time = examTimeInput.value;
    
    // 验证日期是否在未来
    const examTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (examTime <= now) {
        alert('考试时间必须在未来！');
        return;
    }
    
    addExam(name, date, time);
    
    modal.style.display = 'none';
    examForm.reset();
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);