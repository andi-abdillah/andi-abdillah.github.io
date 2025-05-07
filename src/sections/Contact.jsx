import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import InputError from "../components/InputError";
import TextInput from "../components/TextInput";
import InputLabel from "../components/InputLabel";
import TextArea from "../components/TextArea";
import emailjs from "@emailjs/browser";
import Modal from "../components/Modal";
import { TbLoader2 } from "react-icons/tb";

const Contact = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");
  const [isSending, setIsSending] = useState(false);

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
      setIsSending(true);
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
        .then(() => {
          setModalType("success");
          setModalMessage("Your message has been sent successfully!");
          resetForm();
        })
        .catch(() => {
          setModalType("error");
          setModalMessage(
            "Failed to send the message. Please try again later.",
          );
        })
        .finally(() => {
          setIsSending(false);
          setIsModalOpen(true);
        });
    },
  });

  const hasErrors = Object.keys(formik.errors).length > 0;

  const hasFilledValues = Object.values(formik.values).some(
    (value) => value !== "" && value !== null && value !== undefined,
  );

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
                hasError={formik.touched.name && Boolean(formik.errors.name)}
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
                hasError={formik.touched.email && Boolean(formik.errors.email)}
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
              hasError={
                formik.touched.message && Boolean(formik.errors.message)
              }
            />
            {formik.touched.message && (
              <InputError className="mt-2" message={formik.errors.message} />
            )}
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="submit"
              disabled={hasErrors || isSending}
              className={`flex gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-white transition hover:bg-primary/80 ${
                (hasErrors || isSending) && "cursor-not-allowed opacity-50"
              }`}
            >
              {isSending ? (
                <>
                  {"Sending"}
                  <TbLoader2 className="animate-spin text-2xl" />
                </>
              ) : (
                "Send"
              )}
            </button>

            {!isSending && hasFilledValues && (
              <button
                type="button"
                className="rounded-full bg-red-500 px-7 py-3 font-semibold text-white hover:opacity-50"
                onClick={() => formik.resetForm()}
              >
                Cancel
              </button>
            )}
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
              className="rounded-full bg-primary px-7 py-3 font-semibold text-white hover:opacity-50"
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
