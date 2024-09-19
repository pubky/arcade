import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { Root } from "./components/Root";
import { CloseAction } from "./components/CloseAction";

interface SimpleProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  children: React.ReactNode;
}

export default function Simple({
  showModal,
  setShowModal,
  className,
  children,
}: SimpleProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutsideModalDeletePost = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideModalDeletePost);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutsideModalDeletePost
      );
    };
  }, [modalRef, setShowModal]);

  return (
    <Root
      show={showModal}
      modalRef={modalRef}
      className={twMerge("lg:w-[510px]", className)}
    >
      {children}
    </Root>
  );
}
