import { twMerge } from "tailwind-merge";

interface RootModalProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  modalRef: React.RefObject<HTMLDivElement>;
  children?: React.ReactNode;
}

export const Root = ({
  show = false,
  modalRef,
  children,
  ...rest
}: RootModalProps) => {
  return (
    <div className="flex justify-center items-center">
      {show && (
        <div className="fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-70 flex justify-center items-center">
          <div ref={modalRef}>
            <div
              {...rest}
              className={twMerge(
                "relative bg-[#19193e] w-full h-full px-6 pt-6 pb-10 rounded-lg flex-col inline-flex",
                rest.className
              )}
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
