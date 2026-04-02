import svgPaths from "./svg-hxnl9l4gqs";

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
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">Select company size</p>
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

function Frame() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] items-start left-0 top-[73px]">
      <Label />
      <Input />
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="relative size-full">
      <Frame />
      <div className="absolute bg-[#1d1e2b] content-stretch flex flex-col items-start left-0 p-[4px] rounded-[8px] top-0 w-[300px]" data-name="_Simple Dropdown">
        <div aria-hidden="true" className="absolute border border-[#393a4b] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_7px_32px_0px_rgba(0,0,0,0.35)]" />
        <div className="relative rounded-[6px] shrink-0 w-full" data-name="_Dropdown Options">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[42px] items-center pl-[6px] pr-[3px] py-[8px] relative w-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">Select company size</p>
            </div>
          </div>
        </div>
        <div className="relative rounded-[6px] shrink-0 w-full" data-name="_Dropdown Options">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[42px] items-center pl-[6px] pr-[3px] py-[8px] relative w-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">Just me</p>
            </div>
          </div>
        </div>
        <div className="relative rounded-[6px] shrink-0 w-full" data-name="_Dropdown Options">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[42px] items-center pl-[6px] pr-[3px] py-[8px] relative w-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">1-5</p>
            </div>
          </div>
        </div>
        <div className="relative rounded-[6px] shrink-0 w-full" data-name="_Dropdown Options">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center justify-between pl-[6px] pr-[3px] py-[8px] relative w-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">5-25</p>
              <div className="overflow-clip relative shrink-0 size-[16px]" data-name="check">
                <div className="absolute inset-[12.5%_11.19%_17.55%_18.75%]" data-name="Vector">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.21 11.1924">
                    <path d={svgPaths.pc1ef600} fill="var(--fill-0, #858699)" id="Vector" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative rounded-[6px] shrink-0 w-full" data-name="_Dropdown Options">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[42px] items-center pl-[6px] pr-[3px] py-[8px] relative w-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">25-100</p>
            </div>
          </div>
        </div>
        <div className="relative rounded-[6px] shrink-0 w-full" data-name="_Dropdown Options">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[42px] items-center pl-[6px] pr-[3px] py-[8px] relative w-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">100-250</p>
            </div>
          </div>
        </div>
        <div className="relative rounded-[6px] shrink-0 w-full" data-name="_Dropdown Options">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[42px] items-center pl-[6px] pr-[3px] py-[8px] relative w-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">250-1000</p>
            </div>
          </div>
        </div>
        <div className="relative rounded-[6px] shrink-0 w-full" data-name="_Dropdown Options">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[42px] items-center pl-[6px] pr-[3px] py-[8px] relative w-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">1000+</p>
            </div>
          </div>
        </div>
        <div className="relative rounded-[6px] shrink-0 w-full" data-name="_Dropdown Options">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[42px] items-center pl-[6px] pr-[3px] py-[8px] relative w-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#d2d3e0] text-[13px] whitespace-nowrap">Prefer not to share</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}