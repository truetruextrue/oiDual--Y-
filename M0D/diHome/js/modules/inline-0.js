
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            display: ['Space Grotesk', 'sans-serif'],
          },
          colors: {
            dynamic: 'var(--active-color)',
          },
          animation: {
            'breathe-dynamic': 'breathe var(--anim-speed) ease-in-out infinite',
            'float': 'float 8s ease-in-out infinite',
          },
          keyframes: {
            breathe: {
              '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
              '50%': { opacity: '0.6', transform: 'scale(1.05)' },
            },
            float: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
            }
          }
        }
      }
    }
  