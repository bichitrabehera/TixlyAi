import React from "react";

const Header = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="py-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[(--text)] tracking-tight">
            {title}
          </h1>
          {subtitle && <p className=" text-[(--muted)] mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">{children}</div>
      </div>
    </div>
  );
};

export default Header;
