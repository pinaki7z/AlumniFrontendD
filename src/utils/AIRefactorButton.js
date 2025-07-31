import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function AIRefactorButton({ inputText, setInputText }) {
  const [loading, setLoading] = useState(false);

  const refactorText = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to refactor');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [
            {
              role: 'user',
              content: `Refactor this text ("without providing additional information" and  "without any alternative text for the same" ): ${inputText}`
            }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const refactored = data.choices[0].message.content.trim();
        setInputText(refactored);
        toast.success('Text refactored successfully!');
      } else {
        toast.error('Failed to get refactor response from API');
      }
    } catch (error) {
      toast.error('API call error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={refactorText}
      disabled={loading || !inputText.trim()}
      className="
         underline text-blue-500 
         hover:text-blue-600 cursor-pointer
      "
      title="Refactor text using AI"
      tabIndex={0}
    >
      {loading ? 'Improving...' : 'Use AI Improver'}
    </button>
  );
}
