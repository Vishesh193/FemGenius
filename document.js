document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('heartDiseaseForm');
    const resultDiv = document.getElementById('result');
    const resultText = document.getElementById('resultText');

    // Input validation ranges
    const validationRanges = {
        age: { min: 20, max: 100 },
        trestbps: { min: 80, max: 200 },
        chol: { min: 100, max: 600 },
        thalach: { min: 60, max: 220 },
        oldpeak: { min: 0, max: 10 }
    };

    // Add input validation listeners
    Object.keys(validationRanges).forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            input.addEventListener('input', () => validateInput(input, validationRanges[field]));
        }
    });

    function validateInput(input, range) {
        const value = parseFloat(input.value);
        if (value < range.min || value > range.max) {
            input.setCustomValidity(`Value must be between ${range.min} and ${range.max}`);
        } else {
            input.setCustomValidity('');
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const formData = {
            age: parseInt(document.getElementById('age').value),
            sex: parseInt(document.getElementById('sex').value),
            cp: parseInt(document.getElementById('chestPainType').value),
            trestbps: parseInt(document.getElementById('restingBP').value),
            chol: parseInt(document.getElementById('cholesterol').value),
            fbs: parseInt(document.getElementById('fastingBS').value),
            restecg: parseInt(document.getElementById('restingECG').value),
            thalach: parseInt(document.getElementById('maxHR').value),
            exang: parseInt(document.getElementById('exerciseAngina').value),
            oldpeak: parseFloat(document.getElementById('stDepression').value),
            slope: parseInt(document.getElementById('stSlope').value),
            ca: parseInt(document.getElementById('numVessels').value),
            thal: parseInt(document.getElementById('thal').value)
        };

        try {
            const response = await fetch('YOUR_ML_MODEL_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            resultDiv.style.display = 'block';

            // Enhanced risk assessment
            if (result.prediction === 1) {
                resultText.className = 'result-section risk-high';
                let riskFactors = [];
                if (formData.age > 55) riskFactors.push("Age");
                if (formData.trestbps > 140) riskFactors.push("High blood pressure");
                if (formData.chol > 240) riskFactors.push("High cholesterol");
                if (formData.thalach < 120) riskFactors.push("Low maximum heart rate");

                resultText.innerHTML = `
                    <h4>High Risk of Heart Disease Detected</h4>
                    <p>Based on your inputs, you may be at elevated risk for heart disease.</p>
                    ${riskFactors.length ? `<p>Key risk factors identified: ${riskFactors.join(", ")}</p>` : ''}
                    <p><strong>Recommendation:</strong> Please consult a healthcare professional for a thorough evaluation.</p>
                `;
            } else {
                resultText.className = 'result-section risk-low';
                resultText.innerHTML = `
                    <h4>Low Risk of Heart Disease Detected</h4>
                    <p>Your results suggest a lower risk of heart disease. However, maintaining a healthy lifestyle is important.</p>
                    <p><strong>Recommendations:</strong></p>
                    <ul>
                        <li>Regular exercise</li>
                        <li>Balanced diet</li>
                        <li>Regular health check-ups</li>
                        <li>Stress management</li>
                    </ul>
                `;
            }
        } catch (error) {
            console.error('Error:', error);
            resultDiv.style.display = 'block';
            resultText.className = 'alert alert-danger';
            resultText.textContent = 'An error occurred while processing your request. Please try again.';
        }
    });
});
