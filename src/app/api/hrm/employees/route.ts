// src/app/api/hrm/employees/route.ts
// Employee management API endpoints

import { NextRequest, NextResponse } from "next/server";
import { employees, Employee } from "@/data/mockData";

const EMPLOYEE_STATUSES = ["active", "inactive", "on-leave"];

function validateEmployeePayload(body: Partial<Employee>, currentId?: string) {
  const required = ["name", "email", "phone", "role", "department", "joiningDate"] as const;
  for (const field of required) {
    if (!body[field]?.toString().trim()) {
      return `Field '${field}' is required`;
    }
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return "A valid email address is required";
  }

  if (body.status && !EMPLOYEE_STATUSES.includes(body.status)) {
    return "Employee status is invalid";
  }

  const duplicate = employees.find(
    (employee) => employee.email.toLowerCase() === body.email?.toLowerCase() && employee.id !== currentId
  );
  if (duplicate) {
    return "An employee with this email already exists";
  }

  return null;
}

/**
 * GET /api/hrm/employees
 * Retrieve all employees or a specific employee by ID
 * Query params: id (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const employee = employees.find((e) => e.id === id);
      if (!employee) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }
      return NextResponse.json(employee);
    }

    return NextResponse.json({
      data: employees,
      count: employees.length,
    });
  } catch (error) {
    console.error("[API] GET /api/hrm/employees error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/hrm/employees
 * Create a new employee
 * Body: Employee data (without id, createdAt, updatedAt)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationError = validateEmployeePayload(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Create new employee
    const newEmployee: Employee = {
      id: `emp${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      department: body.department,
      joiningDate: body.joiningDate,
      status: body.status || "active",
      bankAccount: body.bankAccount,
      bankCode: body.bankCode,
      taxId: body.taxId,
      dependents: body.dependents,
      nextOfKin: body.nextOfKin,
      nextOfKinPhone: body.nextOfKinPhone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    employees.push(newEmployee);

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/hrm/employees error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/hrm/employees
 * Update an employee
 * Body: Employee data (include id)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const index = employees.findIndex((e) => e.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const validationError = validateEmployeePayload(body, body.id);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Update employee
    const updated: Employee = {
      ...employees[index],
      ...body,
      id: employees[index].id, // Prevent ID change
      createdAt: employees[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    employees[index] = updated;

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[API] PUT /api/hrm/employees error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/hrm/employees
 * Delete (deactivate) an employee
 * Body: { id }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const index = employees.findIndex((e) => e.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Soft delete - mark as inactive instead of removing
    employees[index].status = "inactive";
    employees[index].updatedAt = new Date().toISOString();

    return NextResponse.json({ message: "Employee deactivated successfully" });
  } catch (error) {
    console.error("[API] DELETE /api/hrm/employees error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
