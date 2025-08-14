import { motion } from "framer-motion";

interface HomeProps {
  title: string;
  welcomeMessage: string;
  headLine: string;
  description: string;
  line: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const underlineVariants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: {
      duration: 1,
      delay: 0.5,
      ease: "circOut",
    },
  },
};

export const Home = ({
  title,
  welcomeMessage,
  headLine,
  description,
  line,
}: HomeProps) => {
  return (
    <motion.div
      className="mb-38 px-4 md:px-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-20 md:mb-28">
        <motion.h1
          className="text-7xl md:text-8xl tracking-tighter text-center font-sans font-semibold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600"
          variants={itemVariants}
        >
          {title}
        </motion.h1>
      </div>

      <motion.div className="mb-12 md:mb-24 space-y-6 md:space-y-16" variants={itemVariants}>
        <p className="text-xl md:text-4xl text-center text-neutral-400 tracking-tight px-2">
          {welcomeMessage}
        </p>

        <div className="relative w-fit mx-auto">
          <motion.h2 className="text-2xl md:text-7xl font-poppin text-center text-neutral-400 tracking-tight px-2">
            {headLine}
          </motion.h2>
          <motion.img
            src="/underline.png"
            alt="underline"
            className="absolute top-full translate-x-1/2 mt-2 w-full pointer-events-none hidden md:block"
            variants={underlineVariants}
          />
        </div>

        <motion.div className="px-4 md:px-0">
          <p className="text-sm md:text-xl text-center font-light text-neutral-500 tracking-tight">
            {description}
          </p>
          <p className="text-sm md:text-xl tracking-tight text-center text-neutral-500 mt-2">
            {line}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};