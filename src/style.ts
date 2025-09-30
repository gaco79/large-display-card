import { css } from 'lit';

const style = css`
  :host {
    --line-height: 1.2em;
    --base-font-size: 10cqw;
  }

  /* Animation keyframes */
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideOutLeft {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutUp {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-100%);
      opacity: 0;
    }
  }

  @keyframes slideOutDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  @keyframes slideInDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-in-up {
    animation: slideInUp 0.3s ease-in forwards;
  }

  @keyframes zoomOut {
    from {
      transform: scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: scale(0.8);
      opacity: 0;
      filter: blur(5px);
    }
  }

  @keyframes zoomIn {
    from {
      transform: scale(1.2);
      opacity: 0;
      filter: blur(5px);
    }
    to {
      transform: scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  /* Animation classes */
  .animate-fade-out {
    animation: fadeOut 0.3s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-in forwards;
  }

  .animate-slide-out-left {
    animation: slideOutLeft 0.3s ease-out forwards;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.3s ease-in forwards;
  }

  .animate-slide-out-up {
    animation: slideOutUp 0.3s ease-out forwards;
  }

  .animate-slide-in-down {
    animation: slideInDown 0.3s ease-in forwards;
  }

  .animate-zoom-out {
    animation: zoomOut 0.3s ease-out forwards;
  }

  .animate-zoom-in {
    animation: zoomIn 0.3s ease-in forwards;
  }
`;

export default style;
