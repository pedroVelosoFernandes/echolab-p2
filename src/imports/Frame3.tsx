import svgPaths from "./svg-sdmz9b11b1";

function Label() {
  return (
    <div className="content-stretch flex items-start pl-[2px] py-[4px] relative shrink-0" data-name="Label">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">How large is your company?</p>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex h-[26px] items-center relative shrink-0 w-[248px]" data-name="Content">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">5-25</p>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#292a35] content-stretch flex items-center justify-between pl-[10px] pr-[12px] py-[2px] relative rounded-[6px] shrink-0 w-[300px]" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[#444556] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Content />
      <div className="h-[5px] relative shrink-0 w-[10px]" data-name="chevron-down">
        <div className="absolute inset-[7.4%_12.86%_7.29%_12.9%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.424 4.26531">
            <path d={svgPaths.pd25b600} fill="var(--fill-0, #858699)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative size-full">
      <Label />
      <Input />
    </div>
  );
}