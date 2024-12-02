import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import InputError from "../components/InputError";
import TextInput from "../components/TextInput";
import InputLabel from "../components/InputLabel";
import TextArea from "../components/TextArea";
import emailjs from "@emailjs/browser";
import Modal from "../components/Modal";

const Contact = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      message: "",
    },
    validationSchema: yup.object().shape({
      name: yup
        .string()
        .required("Name is required")
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name cannot exceed 50 characters"),
      email: yup
        .string()
        .required("Email is required")
        .email("Email must be a valid email"),
      message: yup
        .string()
        .required("Message is required")
        .min(10, "Message must be at least 10 characters")
        .max(500, "Message cannot exceed 500 characters"),
    }),
    onSubmit: (values, { resetForm }) => {
      const templateParams = {
        from_name: values.name,
        from_email: values.email,
        to_name: "Amin Abdillah",
        message: values.message,
      };

      emailjs
        .send("my_portfolio", "template_gqerwxr", templateParams, {
          publicKey: "IbAI6dqRBxQejN0HU",
        })
        .then(
          () => {
            setModalType("success");
            setModalMessage("Your message has been sent successfully!");
            resetForm();
          },
          (error) => {
            setModalType("error");
            setModalMessage(
              "Failed to send the message. Please try again later.",
            );
            console.log("FAILED...", error.text);
          },
        )
        .finally(() => {
          setIsModalOpen(true);
        });
    },
  });

  return (
    <section id="contact" className="px-8 py-24">
      <h1 className="mb-16 text-center text-4xl font-bold font-semibold">
        Get in touch
      </h1>
      <div className="mx-auto max-w-lg space-y-4 lg:max-w-2xl">
        <form onSubmit={formik.handleSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <InputLabel htmlFor="name" value="Name" />
              <TextInput
                id="name"
                name="name"
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="name"
              />
              {formik.touched.name && (
                <InputError className="mt-2" message={formik.errors.name} />
              )}
            </div>

            <div>
              <InputLabel htmlFor="email" value="Email" />
              <TextInput
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="email"
              />
              {formik.touched.email && (
                <InputError className="mt-2" message={formik.errors.email} />
              )}
            </div>
          </div>
          <div>
            <InputLabel htmlFor="message" value="Message" />
            <TextArea
              id="message"
              name="message"
              value={formik.values.message}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.message && (
              <InputError className="mt-2" message={formik.errors.message} />
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="rounded-full bg-primary px-7 py-3 font-semibold text-white hover:bg-primary/80"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
      >
        <div className="p-4">
          <h2
            className={`text-center text-xl font-semibold ${modalType === "success" ? "text-green-600" : "text-red-600"}`}
          >
            {modalType === "success" ? "Success" : "Error"}
          </h2>
          <p className="mt-4 text-center">{modalMessage}</p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-full bg-primary px-7 py-3 font-semibold text-white hover:bg-primary/80"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default Contact;
