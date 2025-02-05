"use client";

import { useState, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import "../styles/style.scss";
import dynamicFormData from "./data/formData.json";
import { useRouter } from "next/navigation";

type Member = { id: string; percentage: string };
type FormDataType = {
  [section: string]: Record<string, string> | Member[];
};

const DynamicForm = () => {
  const sections = useMemo(() => Object.keys(dynamicFormData.sections), []);
  const [formData, setFormData] = useState<FormDataType>({});
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [salarySlip, setSalarySlip] = useState<File | null>(null);
  const [salarySlipError, setSalarySlipError] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([{ id: uuidv4(), percentage: "" }]);
  const [percentageError, setPercentageError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const api = process.env.API_ENDPOINT;
  const router = useRouter();

  const activeTab = sections[activeTabIndex];

  const handleChange = useCallback((field: string, value: string, section: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedExtensions = ["pdf", "jpeg", "jpg", "png"];
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

      if (!allowedExtensions.includes(fileExtension)) {
        setSalarySlipError("Invalid file type. Only PDF, JPEG, JPG, and PNG are allowed.");
        setSalarySlip(null);
      } else {
        setSalarySlip(file);
        setSalarySlipError("");
      }
    }
  }, []);

  const validateTab = useCallback(() => {
    const currentFields = dynamicFormData.sections[activeTab];
    let newErrors: Record<string, string> = {};
    if (activeTab === "membersAllocation") {
      const percentageError = validatePercentage();
      if (percentageError) {
        newErrors["members"] = percentageError;
      }
    } else {
      currentFields.forEach((field: string) => {
        const question = dynamicFormData.questions[field];
        if (question.required && !formData[activeTab]?.[field]) {
          newErrors[field] = `${question.label} is required`;
        }
        if (field === "email" && formData[activeTab]?.[field]) {
          const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailPattern.test(formData[activeTab]?.[field])) {
            newErrors[field] = `Invalid email`;
          }
        }
        if (field === "mobile" && formData[activeTab]?.[field]) {
          const phonePattern = /^\d{10}$/;
          if (!phonePattern.test(formData[activeTab]?.[field])) {
            newErrors[field] = `Phone number must be 10 digits`;
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, activeTab]);

  const validatePercentage = useCallback(() => {
    const total = members.reduce((sum, member) =>sum+ Number(member.percentage || 0), 0);
    debugger
    if (total !== 100) {
      setPercentageError("Total percentage cannot exceed 100%.");
      return "Total percentage must be exactly 100%.";
    }
    setPercentageError("");
    return "";
  }, [members]);

  const handleNext = useCallback(() => {
    if (validateTab()) {
      if (activeTabIndex < sections.length - 1) {
        setActiveTabIndex((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }
  }, [activeTabIndex, sections.length, validateTab]);

  const handlePrev = () => {
    if (activeTabIndex > 0) {
      setActiveTabIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if(loading) return;
    if (validateTab()) {
      setLoading(true);
      try{
        const finalFormData = { ...formData, members };
      console.log("Final Form Data:", finalFormData);
      const resp = await fetch(`/api/formData`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalFormData),
      });
      const content = await resp.json();
      router.push("/list");
      console.log(content);
      alert("Form Submitted Successfully!");
      }catch(e){
        console.log(e);
        setLoading(false);
      }
      
    }
  };

  const addMember = () => {
    if (members.length < 3 && members.reduce((sum, member) => sum + Number(member.percentage || 0), 0) < 100) {
      setMembers((prev) => [...prev, { id: uuidv4(), percentage: "" }]);
    }
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
    validatePercentage();
  };

  const handleMemberChange = (index: number, value: string) => {
    setMembers((prev) => {
      const updatedMembers = [...prev];
      updatedMembers[index].percentage = value;
      return updatedMembers;
    });
    setTimeout(() => {
      validatePercentage();
    }, 200);
  };

  return (
    <div className="form-container">
      {/* Tabs */}
      <div className="tabs">
        {sections.map((section, index) => (
          <button key={section} className={index === activeTabIndex ? "active" : ""} onClick={()=>setActiveTabIndex(index)}   disabled ={activeTabIndex<index}>
            {section}
          </button>
        ))}
      </div>

      {/* Form */}
      <form>
        {dynamicFormData.sections[activeTab].map((field: string) => {
          const question = dynamicFormData.questions[field];
          return (
            <div key={field}>
              {activeTab !== "membersAllocation" && (
                <>
                  <label>{question.label}</label>
                  {question.type === "radio" && question.options ? (
                    <div>
                      {question.options.map((option: string) => (
                        <label key={option}>
                          <input
                            type="radio"
                            name={field}
                            value={option.toLowerCase()}
                            checked={formData[activeTab]?.[field] === option.toLowerCase()}
                            onChange={(e) => handleChange(field, e.target.value, activeTab)}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  ) : question.type === "select" && question.options ? (
                    <select value={formData[activeTab]?.[field] || ""} onChange={(e) => handleChange(field, e.target.value, activeTab)}>
                      <option value="">Select</option>
                      {question.options.map((option: string) => (
                        <option key={option} value={option.toLowerCase()}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={question.type}
                      value={formData[activeTab]?.[field] || ""}
                      onChange={(e) => handleChange(field, e.target.value, activeTab)}
                      maxLength={question.label === "Mobile" ? 10 : undefined}
                    />
                  )}
                </>
              )}

              {errors[field] && <p className="error">{errors[field]}</p>}
            </div>
          );
        })}

        {/* Members Allocation */}
        {activeTab === "membersAllocation" && (
          <div>
            <h3>Member Allocation</h3>
            {members.map((member, index) => (
              <div key={member.id}>
                <label>Member {index + 1} Percentage</label>
                <input
                  type="number"
                  value={member.percentage}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                />
                <button type="button" onClick={() => removeMember(member.id)} disabled={members.length <= 1}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn-short" onClick={addMember} disabled={members.length >= 3}>
              Add Member
            </button>
            {percentageError && <p className="error">{percentageError}</p>}
          </div>
        )}

        {/* Salary Slip Upload */}
        {activeTab === "otherDetails" && formData["otherDetails"]?.annualIncome > 50000 && (
          <div>
            <label>Upload Salary Slip</label>
            <input type="file" accept=".pdf,.jpeg,.jpg,.png" onChange={handleFileUpload} />
            {salarySlipError && <p className="error">{salarySlipError}</p>}
          </div>
           // NOTE: file upload need a aws deatail so skipped the upload now
        )}

       

        {/* Navigation Buttons */}
        <div className="navigation-buttons">
          {activeTabIndex > 0 && (
            <button type="button" onClick={handlePrev}>
              Previous
            </button>
          )}
          <button type="button" onClick={handleNext}>
            {activeTabIndex === sections.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DynamicForm;
