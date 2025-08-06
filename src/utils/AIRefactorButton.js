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
      // className="
      //   underline
      //     text-blue-500 bg-blue-100 rounded-xl px-2 font-semibold 
      //    hover:text-blue-700 hover:bg-blue-200 cursor-pointer text-sm 
      // "
       className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${ !inputText.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-600 cursor-pointer text-white hover:shadow-md'
                  }`}
      title="Refactor text using AI"
      tabIndex={0}
    >
      {loading ? 'Modifying...' : 'Modify'}
    </button>
  );
}
