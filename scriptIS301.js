const questionContainer = document.getElementById("question-container");
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answers");
const scoreDisplay = document.getElementById("score-value");

let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Hàm tải câu hỏi từ file JSON
async function loadQuestions(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Lỗi ${response.status}`);
        const data = await response.json();
        // Chuyển đổi và kiểm tra dữ liệu JSON
        return data.map(item => {
            if (!item.id || !item.q || !item.op || !item.a || !item.op[item.a]) {
                console.warn(`Câu hỏi không hợp lệ: ${JSON.stringify(item)}`);
                return null;
            }
            return {
                id: item.id,
                question: item.q,
                options: Object.entries(item.op).map(([key, value]) => ({ key, value })),
                answer: item.op[item.a] // Lấy giá trị của đáp án đúng (văn bản đầy đủ)
            };
        }).filter(item => item !== null); // Loại bỏ câu hỏi không hợp lệ
    } catch (error) {
        console.error(`Lỗi khi tải ${file}:`, error);
        questionElement.innerText = "Không thể tải câu hỏi. Vui lòng thử lại.";
        return [];
    }
}

// Bắt đầu quiz
async function startQuiz() {
    questions = await loadQuestions("QIS301.json"); // Đảm bảo tên file đúng
    if (questions.length === 0) {
        questionElement.innerText = "Không có câu hỏi nào để hiển thị.";
        return;
    }
    showQuestion();
}

// Hiển thị câu hỏi hiện tại
function showQuestion() {
    resetState();

    if (currentQuestionIndex >= questions.length) {
        questionElement.innerText = `Hoàn thành! Bạn đạt ${score}/${questions.length} điểm.`;
        answerButtons.innerHTML = "";
        return;
    }

    let currentQuestion = questions[currentQuestionIndex];
    questionElement.innerText = `${currentQuestion.id}. ${currentQuestion.question}`;

    currentQuestion.options.forEach(option => {
        const button = document.createElement("button");
        button.innerText = `${option.key}. ${option.value}`;
        button.classList.add("btn");
        button.dataset.key = option.key; // Lưu key để tìm đáp án đúng dễ dàng hơn
        button.addEventListener("click", () => selectAnswer(button, option.value, currentQuestion.answer));
        answerButtons.appendChild(button);
    });
}

// Reset giao diện trước khi hiển thị câu hỏi mới
function resetState() {
    answerButtons.innerHTML = "";
}

// Xử lý chọn đáp án
function selectAnswer(button, selectedOption, correctAnswer) {
    if (selectedOption === correctAnswer) {
        button.classList.add("correct");
        score++;
    } else {
        button.classList.add("wrong");
        // Tìm nút của đáp án đúng dựa trên key
        const correctKey = questions[currentQuestionIndex].options.find(opt => opt.value === correctAnswer).key;
        const correctButton = Array.from(answerButtons.children).find(btn => btn.dataset.key === correctKey);
        if (correctButton) {
            correctButton.classList.add("correct");
        }
    }

    // Cập nhật điểm số
    scoreDisplay.innerText = score;

    // Vô hiệu hóa tất cả các nút sau khi chọn
    Array.from(answerButtons.children).forEach(btn => btn.disabled = true);

    // Sau 2 giây tự động chuyển sang câu tiếp theo
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 2000);
}

// Kiểm tra DOM elements
if (!questionContainer || !questionElement || !answerButtons || !scoreDisplay) {
    console.error("Một hoặc nhiều phần tử DOM không tồn tại.");
    questionContainer.innerHTML = "<p>Lỗi: Không tìm thấy các phần tử giao diện cần thiết.</p>";
} else {
    startQuiz();
}