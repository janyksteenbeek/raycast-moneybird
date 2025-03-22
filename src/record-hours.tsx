import { Form, ActionPanel, Action, showToast } from "@raycast/api";
import { useState, useEffect } from "react";
import { useLocalStorage, withAccessToken, useForm } from "@raycast/utils";
import { getContacts, getAdministrationId, provider, getProjects, getUsers, createTimeEntry } from "./oauth/moneybird";
import { MoneybirdApiProject, MoneybirdUser, MoneybirdApiCustomer } from "./types/moneybird";

interface FormValues {
  description: string;
  customerId: string;
  projectId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  breakTime: string;
  declarable: boolean;
}

function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<MoneybirdApiCustomer[]>([]);
  const [projects, setProjects] = useState<MoneybirdApiProject[]>([]);
  const [users, setUsers] = useState<MoneybirdUser[]>([]);
  const { value: startTime } = useLocalStorage("startTime", new Date());

  const [startDate, setStartDate] = useState<Date>(startTime || new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { handleSubmit, itemProps, values, setValue } = useForm<FormValues>({
    initialValues: {
      description: "",
      customerId: "",
      projectId: "",
      userId: "",
      startDate: startTime || new Date(),
      endDate: new Date(),
      breakTime: "0",
      declarable: false
    },
    validation: {
      description: (value) => {
        if (!value || value.length === 0) return "Description is required";
      },
      startDate: (value) => {
        if (!value) return "Start date is required";
      },
      endDate: (value) => {
        if (!value) return "End date is required";
      },
      customerId: (value) => {
        if (!value || value.length === 0) return "Customer is required";
      },
    },
    onSubmit: async (values) => {
      console.log({
        ...values,
        startDate,
        endDate,
        breakTime: parseInt(values.breakTime, 10)
      });
      const administrationId = await getAdministrationId();
      setIsLoading(true);
        const timeEntry = await createTimeEntry(administrationId, {
          started_at: startDate.toISOString(),
          ended_at: endDate.toISOString(),
          project_id: values.projectId,
          customer_id: values.customerId,
          user_id: values.userId,
          description: values.description,
        });

        showToast({ title: "Success", message: "Time entry created" });
        setValue("description", "");
        setValue("customerId", "");
        setValue("projectId", "");
        setValue("userId", "");
        setValue("startDate", new Date());
        setValue("endDate", new Date());
        setValue("breakTime", "0");
      setIsLoading(false);
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const administrationId = await getAdministrationId();
        const [fetchedCustomers, fetchedProjects, fetchedUsers] = await Promise.all([
          getContacts(administrationId),
          getProjects(administrationId),
          getUsers(administrationId)
        ]);

        setCustomers(fetchedCustomers);
        setProjects(fetchedProjects);
        setUsers(fetchedUsers);
      } catch (error) {
        showToast({ title: "Error", message: "Failed to load data:" + error });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField 
        title="Description" 
        placeholder="Enter description" 
        {...itemProps.description}
      />
      <Form.DatePicker 
        id="startDate"
        title="Start Date" 
        value={startDate}
        onChange={(date) => {
          if (date) {
            setStartDate(date);
            setValue("startDate", date);
          }
        }}
      />
      <Form.DatePicker 
        id="endDate"
        title="End Date" 
        value={endDate}
        onChange={(date) => {
          if (date) {
            setEndDate(date);
            setValue("endDate", date);
          }
        }}
      />
      <Form.Checkbox 
        label="Declarable" 
        {...itemProps.declarable}
      />
      <Form.Separator />
      <Form.Dropdown 
        title="Customer"
        isLoading={isLoading}
        {...itemProps.customerId}
      >
        {customers.map((customer) => (
          <Form.Dropdown.Item 
            key={customer.id} 
            value={customer.id} 
            title={customer.company_name || `${customer.firstname} ${customer.lastname}`} 
          />
        ))}
      </Form.Dropdown>
      <Form.Dropdown 
        title="Project"
        isLoading={isLoading}
        {...itemProps.projectId}
      > 
        {projects.map((project) => (
          <Form.Dropdown.Item 
            key={project.id} 
            value={project.id} 
            title={project.name} 
          />
        ))}
      </Form.Dropdown>
      <Form.Dropdown 
        title="User"
        isLoading={isLoading}
        {...itemProps.userId}
      >
        {users.map((user) => (
          <Form.Dropdown.Item 
            key={user.id} 
            value={user.id} 
            title={user.name} 
          />
        ))}
      </Form.Dropdown>
    </Form>
  );
}

export default withAccessToken(provider)(Command);
