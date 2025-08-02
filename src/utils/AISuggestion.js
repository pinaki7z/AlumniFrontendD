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
          'Authorization': `Bearer ${process.env.REACT_APP_API_OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [
            {
              role: 'user',
              content: `without providing any Intro outro ( here is your data , if you have any suggestion, no other suggestion  ) just provide straight forward asnswer to this " ${inputText}" `
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
         underline text-green-500 
         hover:text-green-600 cursor-pointer
      "
      title="Refactor text using AI"
      tabIndex={0}
    >
      {loading ? 'Generating...' : 'Ask Ai'}
    </button>
  );
}
