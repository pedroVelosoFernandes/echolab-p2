import { motion } from 'motion/react';

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function Toggle({ checked = false, onChange }: ToggleProps) {
  const handleClick = () => {
    onChange?.(!checked);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-9 h-[22px] content-stretch flex items-center overflow-clip p-[3px] relative rounded-[12px] transition-all duration-300 ${
        checked ? 'bg-[#575bc7] justify-end' : 'bg-[#393a4b] justify-start'
      }`}
      data-name="Toggle"
      aria-checked={checked}
      role="switch"
    >
      <motion.div
        className="relative shrink-0 size-[16px]"
        data-name="Button"
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" fill={checked ? "white" : "#151621"} id="Button" r="8" />
        </svg>
      </motion.div>
    </button>
  );
}