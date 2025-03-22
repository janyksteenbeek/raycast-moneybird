import { Form, ActionPanel, Action, showToast, Detail } from "@raycast/api";
import { useEffect, useState } from "react";
import { useLocalStorage, withAccessToken } from "@raycast/utils";
import { getContacts, getAdministrationId, provider, getProjects, getUsers } from "./oauth/moneybird";
import { MoneybirdApiProject } from "./types/moneybird";
import { MoneybirdUser } from "./types/moneybird";
import { MoneybirdApiCustomer } from "./types/moneybird";

type Values = {
  textfield: string;
  textarea: string;
  datepicker: Date;
  checkbox: boolean;
  dropdown: string;
  tokeneditor: string[];
};

async function Command() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customers, setCustomers] = useState<MoneybirdApiCustomer[]>([]);
  const [projects, setProjects] = useState<MoneybirdApiProject[]>([]);
  const [users, setUsers] = useState<MoneybirdUser[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<MoneybirdApiCustomer | null>(null);
  const [selectedProject, setSelectedProject] = useState<MoneybirdApiProject | null>(null);
  const [selectedUser, setSelectedUser] = useState<MoneybirdUser | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [breakTime, setBreakTime] = useState<number>(0);
  const [declarable, setDeclarable] = useState<boolean>(false);
  const [description, setDescription] = useState<string | null>(null);

  const { value: startTime } = useLocalStorage("startTime", new Date());


  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      const administrationId = await getAdministrationId();
      const customers = await getContacts(administrationId);
      const projects = await getProjects(administrationId);
      const users = await getUsers(administrationId);
      setCustomers(customers);
      setProjects(projects);
      setUsers(users);
      setSelectedUser(users[0]);
    };
    fetchData().finally(() => setIsLoading(false));
  }, []);

  function handleSubmit(values: Values) {
    console.log(values);
    showToast({ title: "Submitted form", message: "See logs for submitted values" });
  }
  

  if (isLoading) {
    return <Detail isLoading={true} />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="description" title="Description" placeholder="Enter description" onChange={(value) => setDescription(value)} />
      <Form.DatePicker id="startDate" title="Start Date" defaultValue={startTime} onChange={(value) => setStartDate(value)} />
      <Form.DatePicker id="endDate" title="End Date" defaultValue={endDate} onChange={(value) => setEndDate(value)} />
      <Form.TextField  id="hours" title="Break time" defaultValue="0" onChange={(value) => setBreakTime(Number(value))} />
      <Form.Checkbox id="breakTimeCheckbox" label="Declarable" defaultValue={declarable} onChange={(value) => setDeclarable(value)} />
      <Form.Separator />
      <Form.Dropdown id="customer" title="Customer" onChange={(value) => setSelectedCustomer(customers.find(customer => customer.id === value) || null)}>
        {customers.map((customer) => (
          <Form.Dropdown.Item key={customer.id} value={customer.id} title={customer.company_name || customer.firstname + " " + customer.lastname} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="project" title="Project" onChange={(value) => setSelectedProject(projects.find(project => project.id === value) || null)}> 
        {projects.map((project) => (
          <Form.Dropdown.Item key={project.id} value={project.id} title={project.name} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="user" title="User" onChange={(value) => setSelectedUser(users.find(user => user.id === value) || null)}>
        {users.map((user) => (
          <Form.Dropdown.Item key={user.id} value={user.id} title={user.name} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}

export default withAccessToken(provider)(Command);
