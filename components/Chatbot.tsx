import React, { useEffect } from 'react';

interface ChatbotProps {
  bot_id: string;
  bot_logo?: string;
  theme_color?: string;
  // Add any other configurable attributes here
}

const Chatbot: React.FC<ChatbotProps> = ({ bot_id, bot_logo, theme_color }) => {
  useEffect(() => {
    // Create bn-root div if it doesn't exist
    let bnRoot = document.getElementById('bn-root');
    if (!bnRoot) {
      bnRoot = document.createElement('div');
      bnRoot.id = 'bn-root';
      document.body.appendChild(bnRoot);
    }

    // Create and append the first script
    const script1 = document.createElement('script');
    script1.src = `https://cdn.botnoi.ai/chatwidget/scripts/v1/chatwidget.js?bot_id=${bot_id}`;
    script1.async = true;
    document.body.appendChild(script1);

    // Create and append the second script
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.BotnoiChatWidget = {
        bot_id: "${bot_id}",
        bot_logo: "${bot_logo || ''}",
        theme_color: "${theme_color || '#007bff'}",
        // Add other configurations here
      };
    `;
    document.body.appendChild(script2);

    // Cleanup function to remove scripts and elements on component unmount
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
      const bnCustomerChat = document.querySelector('.bn-customerchat');
      if (bnCustomerChat && bnCustomerChat.parentElement === document.body) {
        document.body.removeChild(bnCustomerChat);
      }
      // bn-root is kept as it might be shared or managed by other instances/scripts
    };
  }, [bot_id, bot_logo, theme_color]); // Re-run effect if props change

  return (
    <>
      {/* The bn-root div is created and managed by the useEffect hook */}
      {/* The bn-customerchat div will be created by the Botnoi script */}
    </>
  );
};

export default Chatbot;
