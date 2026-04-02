export default function Toggle() {
  return (
    <div className="bg-[#575bc7] content-stretch flex items-center justify-end overflow-clip p-[3px] relative rounded-[12px] size-full" data-name="Toggle">
      <div className="relative shrink-0 size-[16px]" data-name="Button">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" fill="var(--fill-0, white)" id="Button" r="8" />
        </svg>
      </div>
    </div>
  );
}