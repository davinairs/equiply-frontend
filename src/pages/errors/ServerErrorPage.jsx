import { motion } from "framer-motion";
import { ServerCrash, RotateCcw } from "lucide-react";

function ServerErrorPage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center relative max-w-lg w-full py-10 sm:py-12 px-4 sm:px-6 flex flex-col items-center justify-center"
      >
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0 overflow-hidden">
          <span className="text-[100px] sm:text-[160px] md:text-[400px] font-extrabold text-slate-100 tracking-wider">
            500
          </span>
        </div>

        <div className="relative z-10 space-y-3 flex flex-col items-center">
          <div className="flex justify-center mb-2 text-primary">
            <ServerCrash size={36} className="sm:hidden" />
            <ServerCrash size={40} className="hidden sm:block" />
          </div>

          <h1 className="text-(length:--font-size-h1) font-bold text-text-primary">
            Internal Server Error
          </h1>

          <p className="text-(length:--font-size-body-md) text-text-muted max-w-sm mx-auto px-2 sm:px-0">
            An error occurred on our server. Please try again in a few moments.
          </p>

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReload}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-(length:--font-size-body-sm) font-medium shadow-xs hover:opacity-90 transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
              Reload Page
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ServerErrorPage;
