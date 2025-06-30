import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

/**
 * Tiêu đề trang chuẩn hóa cho các layout trang
 *
 * @component
 */
const PageHeader = ({ title, description, icon, actions, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 mb-6 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="p-3 rounded-xl bg-slate-800/70 text-white">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            {description && <p className="text-slate-300">{description}</p>}
          </div>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

PageHeader.propTypes = {
  /** Tiêu đề chính của trang */
  title: PropTypes.string.isRequired,
  /** Mô tả tùy chọn */
  description: PropTypes.string,
  /** Icon hiển thị bên cạnh tiêu đề */
  icon: PropTypes.node,
  /** Các nút hành động */
  actions: PropTypes.node,
  /** Class tùy chỉnh */
  className: PropTypes.string,
};

export default PageHeader;
