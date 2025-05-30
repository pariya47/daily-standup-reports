import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    BN?: {
      init: (options: { version: string }) => void;
    };
  }
}

interface ChatbotProps {
  bot_id: string; // Required
  bot_logo?: string;
  bot_name?: string;
  theme_color?: string;
  locale?: string;
  logged_in_greeting?: string;
  greeting_message?: string;
  default_open?: boolean;
}

const Chatbot: React.FC<ChatbotProps> = (props) => {
  const {
    bot_id,
    bot_logo,
    bot_name,
    theme_color,
    locale,
    logged_in_greeting,
    greeting_message,
    default_open
  } = props;

  const bnRootCreatedByThisInstance = useRef(false);

  useEffect(() => {
    // 1. Ensure bn-root div exists or create it
    let bnRoot = document.getElementById('bn-root');
    if (!bnRoot) {
      bnRoot = document.createElement('div');
      bnRoot.id = 'bn-root';
      document.body.appendChild(bnRoot);
      bnRootCreatedByThisInstance.current = true;
    }

    // 2. Dynamically add the Botnoi script if not already present
    if (!document.getElementById('bn-jssdk')) {
      const script = document.createElement('script');
      script.id = 'bn-jssdk';
      script.src = 'https://console.botnoi.ai/customerchat/index.js';
      script.async = true;
      script.onload = () => {
        // 3. Call BN.init after script has loaded
        if (window.BN) {
          window.BN.init({ version: '1.0' });
        } else {
          console.error('Botnoi BN object not found after script load.');
        }
      };
      script.onerror = () => {
        console.error('Botnoi script failed to load.');
      };
      document.body.appendChild(script);
    } else {
      // If script already exists, BN.init might need to be called again
      // if the component remounts and the script was already there.
      // However, the original HTML snippet implies BN.init is called once by the script itself
      // or by an inline script after it. For safety, if the script is already there,
      // we assume it's initialized or will self-initialize.
      // If issues arise, one might need to call BN.init() here too,
      // carefully considering multiple calls.
      // For now, adhering to "after it has loaded" means only on initial load.
    }

    // Cleanup function
    return () => {
      const sdkScript = document.getElementById('bn-jssdk');
      if (sdkScript) {
        // It's generally not recommended to remove scripts that might be shared
        // or have persistent effects unless absolutely necessary and understood.
        // However, per instructions:
        document.body.removeChild(sdkScript);
      }

      if (bnRootCreatedByThisInstance.current) {
        const rootDiv = document.getElementById('bn-root');
        if (rootDiv) {
          document.body.removeChild(rootDiv);
        }
        bnRootCreatedByThisInstance.current = false;
      }
      // The .bn-customerchat div is managed by React's rendering, so no manual removal needed here.
    };
  // bot_id is the primary identifier for the chat widget.
  // Other props might change how the widget behaves after init,
  // but the core script loading and init depend on bot_id.
  // If BN.init could be re-called with new props, they would be dependencies.
  // For now, only bot_id is a dependency for script loading logic.
  // However, since BN.init is inside script.onload, this effect essentially runs once for script loading.
  // The data attributes on the div will update with props changes.
  }, [bot_id]); // Dependency array ensures this runs if bot_id changes, which implies a different bot.

  // 4. Render the bn-customerchat div with data attributes
  const dataAttributes: { [key: string]: string | boolean | undefined } = {
    'data-bot_id': bot_id,
    'data-bot_logo': bot_logo,
    'data-bot_name': bot_name,
    'data-theme_color': theme_color,
    'data-locale': locale,
    'data-logged_in_greeting': logged_in_greeting,
    'data-greeting_message': greeting_message,
    'data-default_open': default_open,
  };

  // Filter out undefined props so they don't appear as attributes
  const filteredDataAttributes = Object.entries(dataAttributes).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      (acc as any)[key] = value;
    }
    return acc;
  }, {} as { [key: string]: string | boolean });

  return <div className="bn-customerchat" {...filteredDataAttributes}></div>;
};

export default Chatbot;
