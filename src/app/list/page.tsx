"use client";

import { useState, useEffect } from "react";
import JsonFormatter from 'react-json-formatter'

interface PrimaryDetails {
  name: string;
}

interface ListItem {
  primaryDetails: PrimaryDetails;
}

export default function List() {
  const [list, setList] = useState<ListItem[]>([]);
  const jsonStyle = {
    propertyStyle: { color: 'red' },
    stringStyle: { color: 'green' },
    numberStyle: { color: 'darkorange' }
  }

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await fetch("/api/formData");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data: ListItem[] = await response.json();
        setList(data);
      } catch (error) {
        console.error("Error fetching list:", error);
      }
    };

    fetchList();
  }, []);

  return (
    <div>
      <h1>List of Data</h1>
      <ul>
        {list.length > 0 ? (
          list.map((item, index) => <li key={index} className="list-item">
            <JsonFormatter json={item} tabWith={4} jsonStyle={jsonStyle} />
          </li>)
        ) : (
          <p>No data available</p>
        )}
      </ul>
    </div>
  );
}
